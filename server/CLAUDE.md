# CLAUDE.md — Contexto do Projeto

## Padrão de Camadas

### Controller
- Decorator `@Controller('recurso')`
- Injeta apenas o Service
- Usa `@AuthInfos() profile: ProfileDto` para acessar o usuário autenticado
- Usa `@IsPublic()` em rotas abertas (login, signup)
- Não contém lógica de negócio — apenas repassa ao service

```typescript
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @IsPublic()
  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateMatchDto, @AuthInfos() profile: ProfileDto) {
    return this.matchesService.create(dto, profile.id);
  }
}
```

### Service
- Decorator `@Injectable()`
- Injeta o Repository (nunca o PrismaService diretamente)
- Contém toda a lógica de negócio, validações e exceções HTTP
- Lança `HttpException` com `HttpStatus` adequado

```typescript
@Injectable()
export class MatchesService {
  constructor(private readonly matchesRepository: MatchesRepository) {}

  async findAll() {
    return this.matchesRepository.findAll();
  }

  async create(dto: CreateMatchDto, userId: string) {
    const existing = await this.matchesRepository.findByExternalId(dto.externalMatchId);
    if (existing) {
      throw new HttpException('Match already exists', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return this.matchesRepository.create(dto);
  }
}
```

### Repository
- Decorator `@Injectable()`
- Injeta `PrismaService`
- Contém apenas queries Prisma — sem lógica de negócio
- Métodos: `findAll`, `findOne`, `findBy<Campo>`, `create`, `update`, `delete`

```typescript
@Injectable()
export class MatchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.match.findMany();
  }

  findOne(id: string) {
    return this.prisma.match.findUnique({ where: { id } });
  }

  create(data: CreateMatchDto) {
    return this.prisma.match.create({ data });
  }
}
```

### Module

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesRepository],
  exports: [MatchesService], // exportar se outro módulo precisar
})
export class MatchesModule {}
```

---

## DTOs

- **Input DTOs**: classes com decorators `class-validator` (`@IsString`, `@IsEmail`, `@IsNotEmpty`, `@IsOptional`, etc.)
- **Response/Payload types**: usar `type` (não `class`)
- Arquivo por responsabilidade: `create-X.dto.ts`, `update-X.dto.ts`, `X.dto.ts`

```typescript
// create-match.dto.ts
export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  homeTeam: string;

  @IsString()
  @IsNotEmpty()
  awayTeam: string;

  @IsDateString()
  startTime: string;
}

// update-match.dto.ts
export class UpdateMatchDto {
  @IsOptional()
  @IsString()
  homeTeam?: string;
}

// match.dto.ts
export type MatchDto = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  status: MatchStatus;
};
```

---

## Autenticação

- **Guard global**: `AuthGuard` registrado como `APP_GUARD` no `AppModule` — todas as rotas são protegidas por padrão
- **Rota pública**: use `@IsPublic()` no método ou controller
- **Usuário autenticado**: use `@AuthInfos() profile: ProfileDto` como parâmetro — contém `{ id, email, name }`

```typescript
// Rota pública
@IsPublic()
@Post('login')
login(@Body() dto: LoginDto) { ... }

// Rota autenticada com usuário
@Get('me')
getProfile(@AuthInfos() profile: ProfileDto) {
  return profile;
}

// Rota autenticada com ownership check
@Patch(':id')
update(@Param('id') id: string, @AuthInfos() profile: ProfileDto) {
  if (id !== profile.id) throw new ForbiddenException('...');
  ...
}
```

---

## Testes Unitários

Padrão de mock: criar objeto mock da dependência com `jest.fn()` e usar `useValue` no `TestingModule`.

```typescript
// users.repository.spec.ts
describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    repository = module.get(UsersRepository);
    prisma = module.get(PrismaService);
  });

  it('findOne returns user', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'a@b.com', name: 'A' } as any);
    const result = await repository.findOne('1');
    expect(result).toMatchObject({ id: '1' });
  });
});

// users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UsersRepository);
  });

  it('findOne returns user when found', async () => {
    repository.findOne.mockResolvedValue({ id: '1' } as any);
    const result = await service.findOne('1');
    expect(result).toMatchObject({ id: '1' });
  });
});
```

---

## Convenções Gerais

- Imports sem extensão (CommonJS + `"moduleResolution": "node"`)
- Nunca usar PrismaService diretamente no Controller
- Nunca usar lógica de negócio no Repository
- Exceções via `HttpException(mensagem, HttpStatus.CODIGO)`
- Módulo registra Controller, Service e Repository nos `providers`
- Registrar módulo novo no `imports` de `AppModule`
- `PrismaService` tem `Scope.REQUEST` — não instanciar manualmente

---

## Prisma Schema — Modelos Existentes

| Model       | Campos principais                                                    |
|-------------|----------------------------------------------------------------------|
| Club        | id, slug, name, logoUrl, primaryColor, ssoEndpoint, ssoSecret        |
| User        | id, externalId, email, name, pointsBalance, totalXp, level, clubId   |
| Match       | id, externalMatchId, homeTeam, awayTeam, startTime, status, clubId   |
| Prediction  | id, userId, matchId, predictedHomeScore, predictedAwayScore, processed |
| League      | id, name, isPrivate, inviteCode, clubId                               |
| UserLeague  | userId, leagueId (composite PK)                                       |
| Reward      | id, title, description, pointsCost, stock, clubId                    |
| Redemption  | id, userId, rewardId, status, qrCode                                  |

---

## Variáveis de Ambiente

Ver `.env.example`. Principais:
- `DATABASE_URL` — string de conexão PostgreSQL
- `JWT_SECRET` — segredo JWT
- `PORT` — porta da aplicação (default: 3000)

---

## Scripts

```bash
npm run start:dev    # desenvolvimento com watch
npm run test         # testes unitários (jest)
npm run test:cov     # cobertura
npm run test:e2e     # testes end-to-end
npm run db:seed      # seed do banco
npm run db:reset     # reset de migrations
```
