---
name: nova-feature
description: Gera todos os arquivos de uma nova feature NestJS seguindo o padrão Controller → Service → Repository do projeto. Use quando o usuário pedir para criar uma nova feature, módulo ou recurso da API.
---

Crie uma nova feature NestJS completa seguindo o padrão arquitetural do projeto (CLAUDE.md). Siga rigorosamente estas etapas:

## 1. Identifique o escopo

Pergunte (ou infira do contexto):
- Nome da feature (ex: `matches`, `predictions`, `rewards`)
- Modelos Prisma envolvidos
- Se a feature precisa de autenticação ou tem rotas públicas
- Quais operações CRUD são necessárias

## 2. Crie os arquivos na ordem correta

### `src/features/<feature>/dto/create-<feature>.dto.ts`
- Classe com decorators `class-validator`
- Campos obrigatórios com `@IsNotEmpty()`
- Use `@IsString()`, `@IsEmail()`, `@IsInt()`, `@IsBoolean()`, `@IsDateString()` conforme o tipo

### `src/features/<feature>/dto/update-<feature>.dto.ts`
- Classe com todos os campos `@IsOptional()`
- Copiar campos do Create e adicionar `@IsOptional()` em cada um

### `src/features/<feature>/dto/<feature>.dto.ts`
- `type` (não classe) representando o shape de resposta

### `src/features/<feature>/<feature>.repository.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { Create<Feature>Dto } from './dto/create-<feature>.dto.js';
import { Update<Feature>Dto } from './dto/update-<feature>.dto.js';

@Injectable()
export class <Feature>Repository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.<model>.findMany();
  }

  findOne(id: string) {
    return this.prisma.<model>.findUnique({ where: { id } });
  }

  create(data: Create<Feature>Dto) {
    return this.prisma.<model>.create({ data });
  }

  update(id: string, data: Update<Feature>Dto) {
    return this.prisma.<model>.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.<model>.delete({ where: { id } });
  }
}
```

### `src/features/<feature>/<feature>.service.ts`
```typescript
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { <Feature>Repository } from './<feature>.repository.js';
import { Create<Feature>Dto } from './dto/create-<feature>.dto.js';
import { Update<Feature>Dto } from './dto/update-<feature>.dto.js';

@Injectable()
export class <Feature>Service {
  constructor(private readonly <feature>Repository: <Feature>Repository) {}

  findAll() {
    return this.<feature>Repository.findAll();
  }

  async findOne(id: string) {
    const item = await this.<feature>Repository.findOne(id);
    if (!item) {
      throw new HttpException('<Feature> not found', HttpStatus.NOT_FOUND);
    }
    return item;
  }

  create(dto: Create<Feature>Dto) {
    return this.<feature>Repository.create(dto);
  }

  async update(id: string, dto: Update<Feature>Dto) {
    await this.findOne(id); // valida existência
    return this.<feature>Repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id); // valida existência
    return this.<feature>Repository.delete(id);
  }
}
```

### `src/features/<feature>/<feature>.controller.ts`
```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthInfos } from '../../common/auth/decorators/auth-infos.js';
import { IsPublic } from '../../common/auth/decorators/is-public.js';
import { ProfileDto } from '../auth/dto/profile.dto.js';
import { <Feature>Service } from './<feature>.service.js';
import { Create<Feature>Dto } from './dto/create-<feature>.dto.js';
import { Update<Feature>Dto } from './dto/update-<feature>.dto.js';

@Controller('<feature>s')
export class <Feature>Controller {
  constructor(private readonly <feature>Service: <Feature>Service) {}

  @Get()
  findAll() {
    return this.<feature>Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.<feature>Service.findOne(id);
  }

  @Post()
  create(@Body() dto: Create<Feature>Dto, @AuthInfos() profile: ProfileDto) {
    return this.<feature>Service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Update<Feature>Dto) {
    return this.<feature>Service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.<feature>Service.remove(id);
  }
}
```

### `src/features/<feature>/<feature>.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { <Feature>Controller } from './<feature>.controller.js';
import { <Feature>Repository } from './<feature>.repository.js';
import { <Feature>Service } from './<feature>.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [<Feature>Controller],
  providers: [<Feature>Service, <Feature>Repository],
  exports: [<Feature>Service],
})
export class <Feature>Module {}
```

## 3. Crie os testes unitários

### `src/features/<feature>/<feature>.repository.spec.ts`
- Mock `PrismaService` com `jest.fn()` para cada método Prisma usado
- Testar: retorno correto, chamada com parâmetros esperados

### `src/features/<feature>/<feature>.service.spec.ts`
- Mock `<Feature>Repository` com `jest.fn()` para cada método
- Testar: happy path, not found (HttpException 404), lógica de negócio

### `src/features/<feature>/<feature>.controller.spec.ts`
- Mock `<Feature>Service` com `jest.fn()` para cada método
- Testar: chamadas corretas ao service, passagem de parâmetros

## 4. Registre no AppModule

Adicione `<Feature>Module` ao array `imports` em `src/app.module.ts`.

## Regras obrigatórias

- Todos os imports usam extensão `.js` (ESM)
- Repository nunca lança exceções — apenas acessa o banco
- Service nunca acessa Prisma diretamente — usa Repository
- Controller nunca contém lógica de negócio
- Exceções sempre via `HttpException(msg, HttpStatus.CODE)`
- Rotas protegidas por padrão; use `@IsPublic()` explicitamente quando necessário
