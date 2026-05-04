# TodoDay - Bootstrap Tecnico

Base inicial do produto usando Next.js + Prisma + PostgreSQL com shell autenticado.

## Stack

- Next.js (App Router) + TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS v4
- Base de componentes UI estilo shadcn (tokens + componente `Button`)

## Requisitos

- Node.js 20+
- PostgreSQL 15+
- npm 10+

## Setup por ambiente

### Dev

1. Instale dependencias:

   ```bash
   npm install
   ```

2. Configure ambiente (copie os valores para seu `.env`):

   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/tododay_dev?schema=public"
   TODODAY_ACCESS_PASSCODE="tododay-dev"
   ```

3. Gere cliente Prisma e aplique migracao:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Suba o app:

   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:3000`, faca login com o passcode e valide a rota autenticada em `/app`.

### Test

- Banco dedicado de teste (`tododay_test`).
- Aplicar migracoes com `npx prisma migrate deploy`.
- Seed opcional apenas para testes automatizados.

### Prod

- Definir `DATABASE_URL` de producao.
- Aplicar migracoes com `npx prisma migrate deploy` no pipeline.
- Definir `TODODAY_ACCESS_PASSCODE` seguro e rotacionado por segredo do ambiente.
- Executar `npm run build && npm run start`.

## Decisoes tecnicas

- **Autenticacao inicial:** passcode server-side com cookie HTTP-only (`tododay_session`) para liberar rapidamente o shell protegido sem travar em integracao completa de identidade.
- **Prisma como fonte de verdade de dominio:** schema inclui `User`, `Day`, `Task` e `PomodoroSession`, alem das entidades de autenticacao.
- **Design tokens minimos:** variaveis globais de cor e borda para acelerar evolucao de UI sem acoplamento ao tema default.

## Proximos incrementos priorizados

1. Substituir passcode por autenticacao robusta (NextAuth/OAuth ou e-mail magic link).
2. Criar camada de servicos para regras de negocio de dia/tarefas/streak.
3. Implementar seeds apenas no escopo de testes (fixtures previsiveis).
4. Adicionar pipeline de CI com lint, typecheck e smoke de migracoes.
