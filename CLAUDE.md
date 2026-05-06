# [PROJETO] — Contexto e Regras para Claude Code

## O Projeto


---

## Stack

| Camada    | Tecnologia                        |
| --------- | --------------------------------- |
| Backend   | NestJS v10 + TypeScript           |
| ORM       | Prisma + PostgreSQL 16            |
| Web       | React com Vite                    |
| Runtime   | Node.js 22 LTS                    |
| Container | Docker + Dev Containers           |

---

## Estrutura do Monorepo

```
projeto-teia/
├── .devcontainer/
├── .claude/
│   ├── claude.md        # este arquivo
│   ├── agents/
│   └── skills/
├── server/              # NestJS
│   ├── src/
│   │   ├── common/      # guards, decorators, pipes globais
│   │   └── features/    # modulos por feature
│   └── prisma/
└── web/                 # React + Vite
    ├── src/
    │   ├── contexts/    # React Context (AuthContext)
    │   ├── features/    # paginas e hooks por feature
    │   ├── lib/         # api.ts, queryClient.ts, utils.ts
    │   ├── router/      # createBrowserRouter + ProtectedRoute
    │   └── store/       # auth.store.ts (localStorage)
    └── vite.config.ts
```

---

## Como Claude deve trabalhar neste projeto

### Processo por feature

Antes de escrever qualquer código, proponha a abordagem e aguarde validação. Depois de validado:

1. **Escreva o teste primeiro** — nunca implemente lógica de negócio sem teste cobrindo o comportamento esperado
2. **Implemente o mínimo** que faz o teste passar
3. **Refatore imediatamente** se houver duplicação ou arquivo crescendo além de ~300 linhas
4. **Commit pequeno e coeso** — um commit = uma mudança que passa em lint e testes

### Quando simplificar (sem esperar instrução)

- Proposta com state machine > 4 estados → reduza os estados
- Arquivo ultrapassando 300 linhas → proponha extração antes de continuar
- Mesma lógica aparecendo em 2+ lugares → crie service/hook compartilhado
- Solução com muitas abstrações para um caso de uso simples → simplifique

### O humano decide O QUÊ. Claude decide O COMO.

Nunca assuma que sabe melhor que o humano qual feature deve ser construída ou qual problema resolver. Mas dentro do escopo definido, proponha ativamente a melhor solução técnica.

---

## Regras de Arquitetura

### Backend (NestJS)

**Feature Module Pattern** — cada feature em `src/features/<feature>/`:
- `<feature>.module.ts` — declarações e imports
- `<feature>.controller.ts` — rotas HTTP apenas, sem lógica de negócio
- `<feature>.service.ts` — toda lógica de negócio aqui
- `<feature>.dto.ts` — validação com `class-validator`
- `<feature>.service.spec.ts` — testes unitários
- `<feature>.controller.spec.ts` — testes do controller

**Segurança — regras sem exceção:**
- Toda rota protegida usa `@UseGuards(JwtAuthGuard)`
- Toda query que lista recursos filtra por `club_id`
- DTOs validados com `class-validator` em toda entrada de usuário
- Rate limiting aplicado em rotas públicas

**Nunca:**
- Lógica de negócio dentro de controllers
- `any` explícito sem comentário justificando
- Conectar ao banco real em testes unitários

### Web (React + Vite)

- Componentes são UI puro — sem chamadas de API diretas, sem estado complexo
- Toda chamada de API vive em um hook: `use<Resource>()` com TanStack Query
- Auth via `useAuth()` (React Context) — nunca desserializar o JWT no frontend
- `ProtectedRoute` busca `GET /auth/profile` no mount para popular o contexto
- Instância axios centralizada em `src/lib/api.ts` com interceptor JWT
- Estilização via Tailwind CSS v4 (CSS-first, sem `tailwind.config.js`)
- Componentes de UI via shadcn/ui em `src/components/ui/`
- Interfaces TypeScript definidas localmente (não importar do server)

**Nunca:**
- Chamar `api` diretamente dentro de componente — sempre via hook
- Desserializar o JWT para obter dados do usuário — usar `GET /auth/profile`
- `any` explícito sem comentário justificando

### Mobile (Expo / React Native)

- Componentes são UI puro — sem chamadas de API, sem estado complexo
- Toda chamada de API vive em um hook: `use<Resource>()`
- Estilização via NativeWind
- Interfaces TypeScript replicadas localmente (não importar do server)

### Compartilhado

- TypeScript estrito em todo o codebase
- Prettier: 2 espaços, sem ponto-e-vírgula, aspas simples
- Commits: Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`)

---

## Padrões de Teste

### NestJS — unit test

```typescript
const module = await Test.createTestingModule({
  providers: [
    ServiceUnderTest,
    { provide: PrismaService, useValue: { model: { findMany: jest.fn() } } },
    { provide: DepService, useValue: mockDepService },
  ],
}).compile()

// describe('ServiceName') > describe('methodName') > it('should ...')
```

### NestJS — mock de Prisma

Nunca use `PrismaService` real em testes unitários. Sempre mockar via provider:
```typescript
{ provide: PrismaService, useValue: { user: { findUnique: jest.fn() } } }
```

### React Native

- Usar `@testing-library/react-native`
- Testar comportamento visível, não implementação interna
- Mockar navegação, hooks de API e `AsyncStorage`

---

## 🚧 Common Hurdles

> Atualizar esta seção sempre que encontrar um problema recorrente ou não-óbvio.

### H1 — JWT em testes e2e
`JwtAuthGuard` bloqueia chamadas em testes e2e. Solução: gerar token real via `JwtService.sign()` no setup, ou sobrescrever o guard com mock para o módulo de teste.

### H2 — club_id esquecido em queries
Queries sem filtro por `club_id` expõem dados cross-tenant. Todo repository method que lista recursos deve receber `clubId` como parâmetro explícito e obrigatório.

### H3 — Prisma em testes unitários
Importar `PrismaService` real em unit tests conecta ao banco e falha. Sempre mockar completamente.

---

## 🏛️ Design Patterns

> Atualizar conforme novos padrões emergirem da implementação.

### P1 — Feature Module (NestJS)
Descrito acima na seção de arquitetura. Cada feature é isolada e auto-contida.

### P2 — Hook de API (Mobile)
```typescript
// hooks/useLeaderboard.ts
const { data, loading, error } = useLeaderboard(clubId)
// Nunca chamar API direto dentro de componente
```

### P3 — Guards Compostos para Sócio Ativo
```typescript
@UseGuards(JwtAuthGuard, ActiveMemberGuard)
// ActiveMemberGuard valida user.memberStatus === 'active' após JWT
```

---

## Checklist antes de considerar uma feature completa

Verificar cada item antes de declarar pronto:

- [ ] Testes unitários cobrindo toda lógica de negócio nova
- [ ] `npm test` passa sem erros
- [ ] `npm run lint` passa sem warnings
- [ ] Toda rota nova tem guard aplicado (ou está documentada como pública)
- [ ] Toda query nova filtra por `club_id`
- [ ] DTOs validados com `class-validator`
- [ ] Nenhum arquivo novo ultrapassou 300 linhas
- [ ] Sem duplicação óbvia que deveria ter sido extraída

---

## Games

Documentação detalhada de cada mini-game está em `.claude/games/`:

| Jogo       | Arquivo                        | Descrição resumida                                              |
|------------|--------------------------------|-----------------------------------------------------------------|
| Missing11  | `.claude/games/missing11.md`   | Adivinhe a escalação de um time histórico — Wordle de jogadores |

> Sempre leia o arquivo do game antes de implementar qualquer feature relacionada.

---

## Conexão com Banco

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/socios_hub
```

`db` é o hostname do PostgreSQL dentro do Docker Compose.

---

## Comandos Úteis

```bash
# Backend
cd server && npm run start:dev      # dev server
cd server && npm test               # unit tests
cd server && npm run test:cov       # coverage
cd server && npm run test:e2e       # e2e tests
cd server && npm run lint           # lint

# Web
cd web && npm run dev               # dev server (porta 5173)
cd web && npm run build             # build de produção
cd web && npm run lint              # lint
cd web && npm run test              # testes com vitest

# Mobile
cd mobile && npx expo start --tunnel
```
