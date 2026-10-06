# STATUS

> Last updated: 2026-10-06

## ✅ Concluído

### Fase 0 — Fundação compartilhada
- `src/shared/tokens.ts` — constantes dos tokens de DI (nada de literais soltas).
- `src/shared/providers/http/` — `AxiosHttpClient`: timeout 10s, retry com backoff só em
  429/5xx/rede, `URLSearchParams`, erro Axios → exceção Nest, log de rate limit baixo. Módulo global.
- `src/shared/providers/base/upstream-http.provider.ts` — monta URL, injeta `api_key` só nos hosts
  api.nasa.gov e **redige a chave da resposta** (a NeoWs a devolve nos `links`).
- `src/shared/infra/typeorm/` — `BaseEntity` e `BaseTypeOrmRepository.upsertByNaturalKey`.
- Cache: `getOrSet(key, ttl, factory)` e `invalidatePrefix` via SCAN (era KEYS, bloqueante).
- `src/shared/dto/`, `validators/`, `utils/`, `testing/` — DTOs de intervalo/paginação,
  `IsAfterOrEqual`, `MaxDateRange`, utilitários de data, `redactApiKey`, mock de cache.
- Correções: `BadRequestException`/`NotFoundException` no lugar de `throw new Error` (era 500);
  ordem das rotas do APOD; `DB_PASSWORD` em `ENV_VARIABLE`; `EnvConfigModule` global;
  `package-lock.json` removido (yarn é o único lockfile).

### Fase 1 — APOD migrado para a API WordPress
`ApodWordPressProvider` + mapper. O legado (`api.nasa.gov/planetary/apod`) **morre em 2026-12-01** e
fica no repositório apenas como rollback, fora do `NasaModule`.

### Fase 2 — 11 módulos novos
`neo`, `donki`, `epic`, `eonet`, `mars-weather`, `media`, `tech-transfer`, `tle`, `ssd`, `techport`,
`exoplanets`. 46 rotas sob `/v1`, 12 tags no Swagger, 10 crons de sincronização.

### Fase 4 — Migrations por tabela e arquitetura de testes (2026-09-11)
- **16 migrations, uma por tabela** (+ a da extensão uuid-ossp), com a API tipada do `QueryRunner` e
  `down()` simétrico via `dropTable`. Colunas de `BaseEntity` em `helpers/base-columns.ts`; GIN em
  SQL cru com `@Index(..., { synchronize: false })` na entidade. Aplicadas, revertidas todas as 16 e
  reaplicadas; `migration:generate` sai **vazia**.
- **`tests/` espelhando `src/`**, com os unitários permanecendo em `src/**/*.spec.ts`:
  `tests/integration/` (12 repositórios contra Postgres + 13 providers contra servidor HTTP local),
  `tests/e2e/` (um arquivo por módulo) e `tests/smoke/` (contra a NASA real, fora do CI).
  Apoio em `tests/support/`; banco dedicado `${DB_NAME}_test` criado e migrado pelo `globalSetup`.
- **Totais:** 108 unitários + 126 integração + 76 e2e + 12 smoke.
- Três defeitos reais encontrados pelos testes novos: `findAvailableDates` devolvendo `Date` do fuso
  local em vez de `YYYY-MM-DD`; o cliente HTTP rejeitando `null`, que o DONKI usa para "nenhum
  evento"; e o stub casando pelo primeiro trecho em vez do mais específico.

### Fase 3 — Qualidade
- Swagger completo (`@ApiTags`/`@ApiOperation`/`@ApiProperty`); antes não havia **nenhum** decorator.
- DTOs com `class-validator` em toda entrada.
- 20 suítes / 107 testes unitários + 7 e2e. Os dois specs quebrados de antes foram consertados.
- Migration inicial aplicada: 15 tabelas, índices únicos e 5 GIN.
- CI escrito de fato em `.github/workflows/ci.yml` (a pasta era `worklflows` e o arquivo tinha
  0 byte): lint → build → test → migration → e2e, com Postgres 18 e Redis 7.

### Verificado em execução (2026-09-11)
15 rotas responderam 200 contra os upstreams reais; cache hit ~4ms, hit de banco ~22ms; 422/404 nos
caminhos de erro; `NASA_API_KEY` ausente da resposta da NeoWs; 12 tabelas com linhas persistidas.

### Fase 5 — Limpeza e boot (2026-10-06)
- Removidos todos os comentários explicativos de `src/` e `tests/`; só ficam as diretivas
  `eslint-disable` e o bloco `addBearerAuth` comentado. As armadilhas que só existiam em comentário
  foram para `CLAUDE.md` (seções "Armadilhas dos upstreams" e "Armadilhas do banco").
- `src/main.ts` loga `API docs: http://localhost:${PORT}/api-docs` quando `NODE_ENV !== "production"`.
  `NODE_ENV` é opcional (fora de `ENV_VARIABLE`); o `dockerfile` define `NODE_ENV=production` e o
  `.env.example` traz `NODE_ENV=development`.
- O Swagger continua montado em produção; só o log é condicional.

### Fase 6 — CI/CD (2026-10-06)
- CI em jobs paralelos (lint/format, unit+cobertura, integração+e2e com `migration:check`, build) e
  imagem `linux/arm64` publicada no GHCR em push na `staging`/`production`.
- CD no modelo do api-nimbus: `workflow_run` → SSH na VPS Oracle → `git pull` → pull da imagem
  `<sha>` → migrations antes do `up` → healthcheck em `/health` → rollback automático (todas as
  migrations do deploy + `.last_deploy_tag`).
- `GET /health` (Postgres + Redis com timeout de 3s), `docker-compose.prod.yml` separado do de dev,
  `.dockerignore`, `USER node`, Dependabot e template de PR.
- **Branches (2026-10-06):** só `staging` (default, sem deploy, imagem `:staging`) e `production`
  (imagem `:latest` + CD). `main` removida. A VPS faz `git checkout production` + `merge --ff-only`.
- **Pendente do lado do usuário:** push; environment `production oracle` com secrets neste repo;
  clone + `.env` na VPS; tornar o pacote GHCR público após o primeiro push.

## 🚀 Próxima fase

**Objetivo:** endurecer a operação para múltiplas réplicas e observabilidade.

### Candidatos (nenhum bloqueia o que está entregue)
1. **Lock distribuído do cron.** `node-cron` agenda dentro do processo: com N réplicas cada task roda
   N vezes. O node-cron 4.x expõe `distributed` + `runCoordinator`, que pode usar o Redis já presente.
2. **Cron em variável de ambiente.** As expressões estão fixas nos decorators. Mover para env exige
   acrescentá-las a `ENV_VARIABLE`, que derruba o boot se faltarem.
3. **Rate limit próprio.** `api.nasa.gov` dá 1000 req/h por chave e os crons diários do DONKI (11
   serviços) e do TLE consomem uma fatia previsível; hoje só há log quando a cota fica baixa.
4. **Retenção.** `donki_events`, `ssd_close_approaches` e `tle_records` crescem sem limite.
5. **Autenticação.** `addBearerAuth` segue comentado; não há auth alguma.

### Decisões em aberto
- Nenhuma. Os itens acima são melhorias, não pendências da entrega.

## 📁 Arquitetura ativa

- NestJS + TypeORM (Postgres 18) + Redis 7, cache → banco → upstream.
- 15 tabelas; entidades híbridas (colunas tipadas para consulta + `payload jsonb`).
- Provider/interface por token string; implementações em `implementation/`.
- Scheduler próprio: `@ScheduledTask({ name, cron })` descoberto via `DiscoveryModule`.

## ⚠️ Pendências externas

- APOD legado desligado em **2026-12-01** (já migrado; remover `NasaProvider` depois da data).
- DONKI instável (503 / `upstream connect error`) — o retry cobre.
- `ssd-api.jpl.nasa.gov` e `sscweb.gsfc.nasa.gov` responderam lentamente em alguns testes.

## 🔧 Comandos úteis

```bash
docker compose up -d postgres redis
yarn migration:run                  # 16 migrations, uma por tabela
yarn start:dev                      # Swagger em /api-docs

yarn test                           # unitários (sem banco, sem rede)
yarn test:integration               # repositórios + providers
yarn test:e2e                       # HTTP completo, upstream stubado
yarn test:smoke                     # NASA real; pula sem NASA_API_KEY
yarn lint:check
```
