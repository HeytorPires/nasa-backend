# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn start:dev` — watch mode dev server
- `yarn build` — Nest build
- `yarn lint` — ESLint com `--fix`; `yarn lint:check` só verifica (é o que o CI roda)
- `yarn format:check` / `yarn typecheck` — Prettier e `tsc --noEmit`, ambos no CI
- `yarn migration:check` — `migration:generate --check`: sai com erro se entidade e migration
  divergirem (roda no CI)
- `yarn migration:{run,revert,show}:prod` — CLI do TypeORM sobre `dist/` (sem `ts-node`); é o que
  roda dentro da imagem de produção
- `yarn format` — Prettier sobre `src/**/*.ts` e `tests/**/*.ts`
- `yarn test` — unitários (Jest, `rootDir: src`, padrão `*.spec.ts`); sem banco e sem rede
- `yarn test -- apod.service.spec.ts` — um arquivo; `yarn test -- -t "nome"` — um teste
- `yarn test:integration` — repositórios contra Postgres e providers contra um servidor HTTP local
- `yarn test:e2e` — rota HTTP → serviço → Postgres, upstream stubado
- `yarn test:smoke` — contra a NASA real; pula sozinho sem `NASA_API_KEY` e **não** roda no CI
- `yarn test:cov` — cobertura
- `yarn migration:generate` / `migration:run` / `migration:revert` — o script `typeorm` usa
  `node -r ts-node/register -r tsconfig-paths/register`; sem `tsconfig-paths` o CLI não resolve os
  imports absolutos `src/...`. Com o schema em dia, `migration:generate` **sai vazia**: uma migration
  gerada com conteúdo significa que entidade e migration divergiram
- `docker compose up -d postgres redis` — Postgres 18 + Redis 7 de desenvolvimento, publicados em
  `DB_PORT`/`REDIS_PORT`. `docker-compose.prod.yml` é só da VPS (app + banco sem portas expostas).
  Os dois composes leem `DB_HOST`/`DB_PORT`/`REDIS_HOST`/`REDIS_PORT` do `.env`, e os containers
  escutam nessas portas (`postgres -p`, `redis-server --port`). Na VPS, `DB_HOST=postgres` e
  `REDIS_HOST=redis`: `localhost` dentro do container da aplicação é ela mesma

## Environment

`EnvConfigService` valida no boot e lança listando todas as faltantes: `PORT`, `NASA_API_KEY`,
`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `REDIS_HOST`, `REDIS_PORT`.
`EnvConfigModule` é `@Global()` — todo provider de upstream depende do serviço.

`NODE_ENV` é opcional e fica fora de `ENV_VARIABLE`: qualquer valor diferente de `production`
(inclusive ausente) conta como desenvolvimento, e aí o boot loga a URL do Swagger
(`http://localhost:${PORT}/api-docs`). O `dockerfile` define `NODE_ENV=production`.

Não há autenticação. `JWT_SECRET`/`JWT_EXPIRES_IN` foram removidos do `.env.example`; o bloco
`addBearerAuth` em `src/config/app.config.ts` segue comentado de propósito.

## Architecture

API NestJS que serve de fachada para 12 APIs REST/JSON da NASA. Fluxo de toda consulta:
**cache Redis → Postgres → upstream**, persistindo o que vem do upstream.

**Provider/interface por token string.** Os tokens são constantes em `src/shared/tokens.ts` —
nunca literais soltas. Implementações em `implementation/`, ligadas no `providers` do módulo.
Consequência: **todo token precisa de mock explícito** nos `Test.createTestingModule`; adicionar uma
dependência a um serviço quebra os specs existentes dele.

**Camadas compartilhadas** (use-as em vez de reescrever):
- `src/shared/providers/http/` — `AxiosHttpClient`: timeout de 10s, retry com backoff só em
  429/5xx/rede (nunca em 4xx de cliente), `URLSearchParams` sempre, erro Axios traduzido em exceção
  Nest, log quando o rate limit fica baixo. É `@Global()`.
- `src/shared/providers/base/upstream-http.provider.ts` — `UpstreamHttpProvider`: monta a URL,
  injeta `api_key` **só** quando `requiresApiKey` é `true` (EONET, images-api, TLE, SSD, TechPort e
  Exoplanet não aceitam a chave) e **redige a chave da resposta** — a NeoWs a devolve nos `links`.
- `src/shared/infra/typeorm/` — `BaseEntity` (uuid + created_at/updated_at) e
  `BaseTypeOrmRepository` com `upsertByNaturalKey`, que resolve o conflito no banco (ON CONFLICT) e
  evita a corrida entre uma requisição do usuário e o cron.
- `src/shared/providers/cache/` — `getOrSet(key, ttl, factory)` substitui o trio
  recover/if-null/save; `invalidatePrefix` usa SCAN, não KEYS.
- `src/shared/dto/`, `src/shared/validators/`, `src/shared/utils/` — `DateRangeQueryDto`,
  `IsAfterOrEqual`, `MaxDateRange`, `toIsoDate`/`countDaysBetween`/`addDays`, `redactApiKey`.
- `src/shared/testing/cache-provider.mock.ts` — mock de cache que executa a factory.

**Entidades híbridas:** colunas tipadas apenas para o que é consultado (chave natural, datas, flags)
mais `payload jsonb` com o registro completo. Índices GIN (arrays e jsonb) são escritos à mão na
migration — o decorator `@Index` do TypeORM só gera B-tree.

**Scheduler:** anote um método de qualquer `@Injectable()` com `@ScheduledTask({ name, cron })`;
o `SchedulerRunnerService` descobre via `DiscoveryModule` e **nenhuma alteração de módulo é
necessária**. `CronProvider` destrói os timers em `onApplicationShutdown` (por isso
`app.enableShutdownHooks()`); sem isso o processo e a suíte de testes não terminam.

**Ao criar um módulo novo:** registre a entidade no array `entities` de
`src/config/typeorm.config.ts` (**não há autoload por glob**) e o módulo em `src/app.module.ts`.

**Migrations:** uma por tabela em `src/shared/infra/typeorm/migrations/`, com a API tipada do
`QueryRunner` (`createTable(new Table({...}))`, `createIndex(new TableIndex({...}))`) e `down()`
simétrico via `dropTable`. As colunas de `BaseEntity` vêm de `helpers/base-columns.ts`. Índices GIN
são escritos em SQL cru — `TableIndex` não expressa o método do índice — e a entidade os declara com
`@Index("nome", { synchronize: false })`, senão `migration:generate` os dropparia ou os reescreveria
como B-tree.

**Testes:** unitários ficam colocados em `src/**/*.spec.ts`; integração, e2e e smoke moram em
`tests/`, espelhando a estrutura de `src/` (`tests/integration/modules/<feature>/`,
`tests/integration/shared/providers/<name>/`, `tests/e2e/modules/<feature>/`). O apoio comum está em
`tests/support/`: `database.ts` (banco `${DB_NAME}_test`, criado e migrado pelo `globalSetup`),
`test-app.ts` (aplicação completa com stub de HTTP e cache em memória), `upstream-stub.ts`,
`upstream-server.ts` (servidor local que exercita o `AxiosHttpClient` real) e `smoke.ts`.
Os arquivos de `tests/support/` importam `src/` por caminho **relativo**: o `globalSetup` do Jest
roda fora do `moduleNameMapper`.

**Rotas:** `@Controller({ path, version: "1" })` — tudo sob `/v1`. Rotas literais precisam ser
declaradas **antes** das com parâmetro (`:date` capturaria `random` e `range`). Validação por DTO
com `class-validator` (o `ValidationPipe` global responde 422, com `whitelist` e
`forbidNonWhitelisted`); use exceções HTTP do Nest, nunca `throw new Error`.

**Imports** absolutos a partir da raiz (`import ... from "src/shared/..."`), via tsconfig
`paths: { "*": ["./*"] }` e `moduleNameMapper` do Jest. Relativos só dentro de `src/config/` e da
própria subárvore de uma pasta.

**Comentários:** nenhum comentário explicativo no código; o conhecimento não óbvio vai para este
arquivo. Só ficam diretivas de ferramenta (`eslint-disable`) e o bloco `addBearerAuth` comentado.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): jobs paralelos `lint`, `test` (cobertura), `integration`
  (`migration:check` + integração + e2e com Postgres/Redis) e `build`; o job `docker` depende dos
  quatro e constrói `linux/arm64` em `ubuntu-24.04-arm` (a VPS Oracle é aarch64; imagem x86 morre com
  `exec format error`). Só publica no GHCR em push na `main`. Cada job declara os próprios steps de
  Node (setup-node 24, cache de `node_modules` pela chave do `yarn.lock`, install só em cache miss),
  sem composite action. O job unitário roda `yarn test --ci --coverage`.
- **CD** (`.github/workflows/cd.yml`): `workflow_run` do CI verde na `main`, environment
  `production oracle`. Na VPS: `git pull`, pull da imagem `<sha>`, **migrations antes do `up`** num
  container efêmero, healthcheck em `/health` e rollback automático (reverte todas as migrations do
  deploy e volta para `.last_deploy_tag`). Mesmo modelo do `HeytorPires/api-nimbus`.
- **Migration em produção roda no deploy, nunca no boot** (`migrationsRun` fica desligado). O
  `DataSource` default de `src/config/typeorm.config.ts` monta o glob a partir de `__dirname` com a
  extensão do próprio arquivo: serve ao `ts-node` (`src/`) e ao `dist/` sem casar os `.d.ts`.
- **`GET /health`** (fora do `/v1`, fora do Swagger): `SELECT 1` + `PING` no Redis, cada um com
  timeout de 3s. Sem o timeout o `ioredis` enfileira o `PING` com o Redis fora e a rota trava em vez
  de responder 503. `ICacheProvider.ping()` existe só para isso.

## Armadilhas dos upstreams (verificadas em 2026-09-11)

- **APOD legado morre em 2026-12-01.** O provider ativo é `ApodWordPressProvider`. A API WordPress
  **ignora** `date`, `start_date`, `end_date` e `count`, ao contrário do que a doc da NASA diz; só
  `per_page` (máx. 25) e `page` funcionam na coleção. O filtro confiável é
  `GET /apod-basic/{yymmdd}`, e intervalo/sorteio são montados no provider.
- **NeoWs devolve a `api_key` nos `links`** de toda resposta. Nunca repasse payload de api.nasa.gov
  sem passar por `UpstreamHttpProvider`.
- **TechTransfer:** `api.nasa.gov/techtransfer` responde HTML, não JSON. O backend real é
  `technology.nasa.gov/api/query`, que devolve arrays posicionais.
- **EPIC:** `api.nasa.gov/EPIC` é só um redirect para `epic.gsfc.nasa.gov`, que é aberto.
- **Exoplanet TAP executa ADQL cru.** A API expõe filtros nomeados e monta o ADQL a partir da
  allowlist `EXOPLANET_COLUMNS`; nunca aceite um `where` do cliente.
- **Mars Rover Photos e Earth Imagery saíram do ar** (404/timeout) e ficaram fora da doc oficial.
- **DONKI cai com frequência** (503 / `upstream connect error`); o retry do cliente HTTP cobre isso.
  Alguns serviços devolvem `null` em vez de `[]` quando não há eventos; quem normaliza é o provider.
  Filtros extras (catálogo, velocidade, tipo) não são reproduzíveis no banco e sempre vão ao upstream.
- **Horários sem fuso são UTC:** EPIC (`YYYY-MM-DD HH:mm:ss`) e SSD/CAD (`2024-Jan-01 02:47`).
- **TechPort** devolve datas como `YYYY-M-D`, sem zero à esquerda; o detalhe vem envelopado em
  `project`, a listagem não.
- **InSight (Mars Weather)** só expõe os sete sols mais recentes e recalcula valores; o histórico
  existe apenas no nosso banco.

## Armadilhas do banco

- `getRawMany` não passa pelo conversor de coluna do TypeORM: uma coluna `date` volta como `Date`
  deslocado pelo fuso. Por isso o repositório EPIC usa `TO_CHAR`.
- Intervalos com fim inclusivo usam `< endDate + 1 dia`; `<= endDate::date` perde eventos do último
  dia (DONKI).
- `neo_feed_days` existe para distinguir "dia sem aproximações" de "dia nunca consultado".
- `payload: null` em `techport_projects` significa que só o resumo da listagem foi baixado; o serviço
  busca o detalhe no upstream.
- A primeira migration habilita `uuid-ossp` (default `uuid_generate_v4()` das PKs).

## Package manager

`yarn`. `package-lock.json` foi removido e está no `.gitignore`; o `dockerfile` instala com yarn.
