# Memory

> Chronological action log. Hooks and AI append to this file automatically.
> Old sessions are consolidated by the daemon weekly.

## Session: 2026-08-10 10:37

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 14:20 | Migrated ORM Prisma -> TypeORM (drop+recreate strategy, Repository pattern) | app.module.ts, apod.module.ts, apod.entity.ts, config/typeorm.config.ts, repositories/typeorm/*, package.json, CLAUDE.md; removed prisma/, src/generated/prisma/, src/modules/prisma/ | build+tests green (pre-existing failures in apod.service.spec.ts/env-config.service.spec.ts untouched, not caused by this change) | ~40k |

## Session: 2026-08-10 10:49

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-08-10 10:51

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-08-10 10:51

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-08-10 10:53

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-08-10 16:46

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-09-02 11:28

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 11:29 | /init: reescreveu CLAUDE.md com correções (docker-compose existe, test:e2e sem test/, CI 0 bytes em .github/worklflows, DB_PASSWORD não validado, dois lockfiles, testes que já falham) | CLAUDE.md | ok | ~14k |

## Session: 2026-09-02 13:16

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-09-02 13:18

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-09-02 13:18

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 13:39 | Planejou e implementou scheduler generico (DiscoveryService + decorator @ScheduledTask) | scheduler/* , app.module.ts, apod.service.ts | build OK, runner testado em app isolado: task descoberta, agendada e executada | ~40k |
| 13:45 | Atualizou contexto OpenWolf | .wolf/cerebrum.md, .wolf/buglog.json, .wolf/STATUS.md, .wolf/anatomy.md | bug-001 registrado (this binding no CronProvider) | ~5k |
| 14:01 | Simplificou o scheduler a pedido do usuario (removeu Set de duplicatas, skip request-scoped, timezone/noOverlap opcionais, metodo privado extra) | scheduler-runner.service.ts, cron-provider.ts, task.interface.ts | 86 -> 44 linhas no runner, 106 no total; build+lint+runner revalidados | ~8k |


## Session: 2026-09-11 08:53

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## 2026-09-11 — Cobertura completa das APIs REST/JSON da NASA

| HH:MM | descrição | arquivo(s) | resultado | ~tokens |
| 09:00 | Levantamento das 16 APIs via `nasa/api-docs` + sondagem HTTP de cada endpoint | — | 12 REST/JSON válidas; Mars Rover Photos e Earth Imagery mortas | ~15k |
| 09:10 | Plano aprovado com o usuário (escopo, persistência total, migração do APOD, melhorias) | plano | 4 decisões fechadas | ~4k |
| 09:15 | Fase 0: tokens, cliente HTTP com retry, UpstreamHttpProvider, BaseEntity/Repository, getOrSet, DTOs e validadores compartilhados | `src/shared/**` | TSC limpo | ~12k |
| 09:20 | Correções obrigatórias: exceções HTTP, ordem de rotas, DB_PASSWORD, lockfile | `src/modules/apod/**`, `src/env-config/**` | 43 testes verdes | ~6k |
| 09:25 | Fase 1: APOD migrado para a API WordPress (contrato real difere da doc) + mapper | `src/shared/providers/nasa/**` | 6 testes do provider | ~8k |
| 09:30 | Fase 2: 11 módulos novos (provider + entidade + repositório + DTO + serviço + controller) | `src/modules/**`, `src/shared/providers/**` | 46 rotas | ~40k |
| 09:35 | Descoberto vazamento da NASA_API_KEY nos `links` da NeoWs; `redactApiKey` aplicado no provider base | `src/shared/utils/sanitize.util.ts` | chave ausente da resposta | ~3k |
| 09:40 | Migration inicial gerada e aplicada (15 tabelas, índices únicos, 5 GIN, uuid-ossp) | `src/shared/infra/typeorm/migrations/` | schema criado | ~5k |
| 09:45 | Boot verificado: 10 crons agendados, 15 rotas 200, cache/banco/upstream conferidos | — | tudo verde | ~4k |
| 09:50 | E2E criado (`test/`, que não existia), cron destruído no shutdown, CI escrito em `.github/workflows/` | `test/**`, `.github/workflows/ci.yml` | 107 unit + 7 e2e | ~10k |
| 09:55 | README e CLAUDE.md reescritos; cerebrum, buglog e STATUS atualizados | docs, `.wolf/**` | — | ~8k |

## 2026-09-11 (tarde) — Migrations por tabela e arquitetura de testes em `tests/`

| HH:MM | descrição | arquivo(s) | resultado | ~tokens |
| 13:05 | Migration monolítica revertida e apagada; plano refeito com o usuário (4 decisões) | plano | granularidade por tabela, API tipada do QueryRunner | ~5k |
| 13:15 | 16 migrations + helper `baseColumns()` | `src/shared/infra/typeorm/migrations/**` | 16 aplicadas, 16 revertidas, reaplicadas | ~12k |
| 13:25 | Drift do GIN resolvido com `@Index(..., { synchronize: false })` | 4 entidades | `migration:generate` sai vazia | ~4k |
| 13:35 | `tests/support/`: banco de teste, factory da app, stub, servidor HTTP local, cache | `tests/support/**` | infra validada no 1º spec | ~10k |
| 13:45 | Integração dos 12 repositórios contra Postgres | `tests/integration/modules/**` | 64 testes; bug do `getRawMany` corrigido | ~14k |
| 13:55 | Integração dos 13 providers contra servidor HTTP local | `tests/integration/shared/providers/**` | 62 testes; guard de `null` do cliente HTTP corrigido | ~14k |
| 14:05 | E2E por módulo, aposentando `test/app.e2e-spec.ts` | `tests/e2e/modules/**` | 76 testes; stub passou a casar pelo trecho mais longo | ~14k |
| 14:15 | Suíte smoke contra a NASA real | `tests/smoke/**` | 11/12 (DONKI em 503 de verdade) | ~5k |
| 14:20 | Scripts, `tsconfig.eslint.json`, CI, README, CLAUDE.md, `.wolf/**` | configs e docs | lint e build limpos | ~7k |

## Session: 2026-09-25 15:14

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-09-25 15:14

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-09-25 15:14

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 15:17 | Removidos comentários redundantes (restatement de nome, cabeçalhos de seção, duplicatas entidade/migration) em 21 arquivos | src/, tests/support/ | lint/build/test ok | ~15k |

## Session: 2026-09-25 16:34

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-10-06 08:31

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 08:50 | Removidos todos os comentários explicativos de src/ e tests/ (script com AST do typescript); armadilhas migradas para CLAUDE.md; lint/tsc/build/unit/integration/e2e verdes | src/**, tests/**, CLAUDE.md | ok | ~40k |
| 08:58 | Log da URL do Swagger no boot quando NODE_ENV != production; dockerfile define NODE_ENV=production | src/main.ts, dockerfile, .env.example, CLAUDE.md | ok | ~8k |

## Session: 2026-10-06 08:59

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-10-06 08:59

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 09:01 | Handoff: STATUS.md (Fase 5), cerebrum (NODE_ENV), CLAUDE.md (regra de comentários em Architecture, format tests/), README | .wolf/*, CLAUDE.md, README.md | ok | ~6k |
| 10:42 | CI/CD no modelo api-nimbus: ci.yml paralelo + imagem arm64 GHCR, cd.yml com migrations e rollback, /health, compose dev/prod separados, dependabot, docs | .github/*, src/modules/health, docker-compose*.yml, dockerfile, package.json, README, CLAUDE.md | ok | ~60k |
| 10:47 | Desfeitos 7 commits de CI/CD (reset --mixed, nada perdido); CI com steps de Node explícitos por job e yarn test --ci --coverage; regra 'nunca commitar sem pedir' em memória e cerebrum | .github/workflows/ci.yml, README.md, CLAUDE.md, .wolf/cerebrum.md | ok | ~8k |
| 11:32 | Composes com hosts/portas do Postgres e Redis vindos do .env; testado dev (5432/6379) e prod com 5433/6380 (/health 200) | docker-compose*.yml, README.md, CLAUDE.md | ok | ~6k |
