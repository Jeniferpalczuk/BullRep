# BullRep

App Next.js com `Prisma + JWT` usando PostgreSQL no Neon.

## Configuracao

Copie `.env.example` para `.env` e preencha os valores locais:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
JWT_SECRET="troque-por-um-segredo-forte"
```

## Neon Console

1. Crie o banco no Neon.
2. Copie a connection string do painel do Neon para `DATABASE_URL`.
3. Execute o SQL de [neon/schema.sql](neon/schema.sql) no SQL Editor do Neon.
4. Rode `npx prisma generate`.
5. Inicie com `npm run dev`.

## Observacoes

- O projeto nao depende mais de servicos externos para auth ou queries do banco.
- O token de login fica salvo no `localStorage` com a chave `bullrep_token`.
- Se quiser limpar a dependencia antiga do lockfile, rode `npm install`.

## GitHub e CI

O repositório já inclui um workflow de CI em `.github/workflows/ci.yml` que:

- instala dependências com `npm ci`
- executa `npx prisma generate`
- roda `npm run lint`
- roda `npx tsc --noEmit`
- executa `npm run build` usando variáveis de ambiente de teste

Antes de publicar no GitHub, confirme que você adicionou `.env` local e não comitou segredos.
