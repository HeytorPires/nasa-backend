# NASA API

Fachada única sobre o catálogo REST/JSON aberto da NASA. Cada consulta segue o mesmo caminho —
**cache Redis → Postgres → upstream da NASA** — e o que vem do upstream é persistido, de modo que o
serviço acumula um histórico que as APIs de origem não oferecem.

- Swagger: `http://localhost:$PORT/api-docs` (fora de produção, o boot loga esse link)
- Versionamento por URI: todas as rotas vivem sob `/v1`.

## APIs cobertas

| Tag | Rotas | Upstream |
|---|---|---|
| APOD | `GET /v1/apods/:date`, `/v1/apods/range`, `/v1/apods/random` | `science.nasa.gov/wp-json/wp/v2/apod-basic` |
| NeoWs | `GET /v1/neo/feed`, `/v1/neo/browse`, `/v1/neo/:asteroidId` | `api.nasa.gov/neo/rest/v1` |
| DONKI | `GET /v1/donki/{cme,cme-analysis,gst,ips,flr,sep,mpc,rbe,hss,wsa-enlil,notifications}` | `api.nasa.gov/DONKI` |
| EPIC | `GET /v1/epic/:collection/{latest,dates,date/:date}` | `epic.gsfc.nasa.gov/api` |
| EONET | `GET /v1/eonet/{events,categories,sources,layers}` | `eonet.gsfc.nasa.gov/api/v3` |
| Mars Weather | `GET /v1/mars-weather`, `/v1/mars-weather/:sol` | `api.nasa.gov/insight_weather` |
| Image and Video Library | `GET /v1/media/search`, `/v1/media/:nasaId/{asset,metadata,captions}` | `images-api.nasa.gov` |
| TechTransfer | `GET /v1/tech-transfer/{patents,patents-issued,software,spinoffs}` | `technology.nasa.gov/api/query` |
| TLE | `GET /v1/tle`, `/v1/tle/:satelliteId` | `tle.ivanstanojevic.me/api` |
| SSD/CNEOS | `GET /v1/ssd/{close-approaches,fireballs,sentry,nhats,scout,mission-design}` | `ssd-api.jpl.nasa.gov` |
| TechPort | `GET /v1/techport/projects`, `/v1/techport/projects/:id` | `techport.nasa.gov/api` |
| Exoplanets | `GET /v1/exoplanets` | `exoplanetarchive.ipac.caltech.edu/TAP` |

Fora do escopo por não serem REST/JSON: GIBS, Vesta/Moon/Mars Trek (WMTS) e Satellite Situation
Center. Mars Rover Photos e Earth Imagery saíram do ar e não foram implementadas.

## Notas de upstream

- **APOD:** a API legada (`api.nasa.gov/planetary/apod`) será desligada em **2026-12-01**. O provider
  ativo já é o da API WordPress. O contrato real dela difere da tabela publicada em api.nasa.gov:
  a coleção só respeita `per_page` (teto de 25) e `page`; `date`, `start_date`, `end_date` e `count`
  são ignorados. O único filtro confiável é a rota por data `GET /apod-basic/{yymmdd}`, então
  intervalos e sorteios são montados no servidor a partir de requisições por data.
  `NasaProvider` continua no repositório como rollback, não registrado no `NasaModule`.
- **`api_key` na resposta:** a NeoWs devolve a chave usada na requisição dentro dos campos `links`.
  `UpstreamHttpProvider` redige esse valor antes de responder ao cliente.
- **TechTransfer:** `api.nasa.gov/techtransfer` hoje responde com a página HTML do portal em vez de
  JSON, mesmo com `Accept: application/json`. O provider consome o backend real,
  `technology.nasa.gov/api/query`, e converte os arrays posicionais em objetos nomeados.
- **EPIC:** o caminho por `api.nasa.gov` é só um redirect para `epic.gsfc.nasa.gov`, que é aberto.
  Vamos direto, poupando um salto e a cota da chave.
- **Exoplanet Archive:** o TAP executa qualquer ADQL recebido. A API **não** aceita ADQL livre —
  expõe filtros nomeados, valida contra uma allowlist de colunas e monta a consulta no servidor,
  sempre com `TOP` e um teto de 500 linhas.

## Comandos

```bash
yarn install

docker compose up -d postgres redis   # Postgres 18 + Redis 7
yarn migration:run                    # cria o schema

yarn start:dev                        # dev com watch
yarn build && yarn start:prod

yarn test                             # unitários (sem banco, sem rede)
yarn test:integration                 # repositórios e providers (Postgres de pé)
yarn test:e2e                         # HTTP completo, upstream stubado
yarn test:smoke                       # contra a NASA real; fora do CI
yarn test:cov
yarn lint                             # corrige
yarn lint:check                       # só verifica, usado no CI
yarn format:check                     # Prettier, usado no CI
yarn typecheck                        # tsc --noEmit
yarn migration:check                  # falha se entidade e migration divergirem
```

Migrations: uma por tabela em `src/shared/infra/typeorm/migrations/`, escritas com a API tipada do
`QueryRunner`. `yarn migration:generate` grava no mesmo diretório e **deve sair vazia** enquanto o
schema corresponder às entidades; `yarn migration:revert` desfaz a última.

## Testes

| Suíte | Onde | O que cobre | Precisa de |
|---|---|---|---|
| Unitários | `src/**/*.spec.ts`, ao lado do código | Serviços com todas as dependências mockadas | nada |
| Integração | `tests/integration/` | Repositórios contra Postgres e providers contra um servidor HTTP local | Postgres |
| E2E | `tests/e2e/` | Rota HTTP → serviço → Postgres, um arquivo por módulo | Postgres |
| Smoke | `tests/smoke/` | Forma das respostas dos upstreams reais | rede + `NASA_API_KEY` |

`tests/` espelha `src/`: `tests/integration/modules/<feature>/`,
`tests/integration/shared/providers/<name>/`, `tests/e2e/modules/<feature>/`. O apoio comum vive em
`tests/support/` — banco de teste, factory da aplicação, stub do cliente HTTP, servidor HTTP local e
cache em memória.

Integração e e2e rodam contra um banco dedicado, `${DB_NAME}_test`, criado e migrado pelo
`globalSetup`. Como o schema vem das migrations e não de `synchronize`, cada execução verifica que as
migrations continuam correspondendo às entidades. A suíte smoke pula sozinha quando não há
`NASA_API_KEY`.

## Variáveis de ambiente

`EnvConfigService` valida no boot e lança listando todas as que faltarem:

`PORT`, `NASA_API_KEY`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`,
`REDIS_HOST`, `REDIS_PORT`. Veja `.env.example`.

`NODE_ENV` é opcional: fora de `production`, o boot loga a URL do Swagger.

## CI/CD

Duas branches: **`staging`** (default; PRs e dependabot entram aqui) e **`production`**. Release é
um merge de `staging` em `production`, via PR ou direto.

**CI** (`.github/workflows/ci.yml`, em todo PR e push para `staging` e `production`), com jobs em
paralelo:

| Job | O que roda |
|---|---|
| Lint & Format | `format:check`, `lint:check` |
| Unit tests | `typecheck`, `yarn test --ci --coverage` (relatório como artifact) |
| Integration & e2e | `migration:run`, `migration:check`, `test:integration`, `test:e2e` contra Postgres 18 + Redis 7 |
| Build | `yarn build` |
| Docker image | Depois dos quatro acima. Constrói a imagem `linux/arm64`; em push, publica `ghcr.io/heytorpires/nasa-backend:<sha>` mais `:staging` (push na `staging`) ou `:latest` (push na `production`) |

**CD** (`.github/workflows/cd.yml`) dispara quando o CI de um push na `production` termina verde
(`staging` não tem deploy) e roda na VPS via SSH:

1. `git checkout production` + `git merge --ff-only origin/production` (só para atualizar o
   `docker-compose.prod.yml`);
2. `pull` da imagem `<sha>` testada no CI;
3. `migration:run:prod` num container efêmero da imagem nova, **antes** de trocar a aplicação;
4. `up -d app` e healthcheck em `GET /health` (Postgres + Redis);
5. se o healthcheck falhar: reverte todas as migrations aplicadas neste deploy, volta para a imagem
   gravada em `.last_deploy_tag` e marca o run como falho.

### Setup único da VPS

```bash
git clone -b production https://github.com/HeytorPires/nasa-backend.git /home/ubuntu/nasa/nasa-backend
cd /home/ubuntu/nasa/nasa-backend
cp .env.example .env   # NODE_ENV=production, uma PORT livre, credenciais reais
```

No `.env` da VPS, os hosts são os nomes dos serviços do compose, não `localhost`:

```dotenv
DB_HOST=postgres
DB_PORT=5432
REDIS_HOST=redis
REDIS_PORT=6379
```

- No GitHub, crie o environment **`production`** com os secrets `VPS_HOST`, `VPS_USER`,
  `VPS_SSH_KEY`, `VPS_PORT` (opcional, padrão 22) e `DEPLOY_PATH` (opcional, padrão
  `/home/ubuntu/nasa/nasa-backend`).
- Depois do primeiro push publicado, torne público o pacote `nasa-backend` em *Packages* do GitHub,
  para a VPS baixar a imagem sem login.
- Em produção, Postgres e Redis ficam só na rede interna do compose; apenas `PORT` é publicada.
  `DB_PORT` e `REDIS_PORT` definem a porta em que os containers escutam, sem expô-la no host.

Dev e produção usam arquivos separados: `docker-compose.yml` (Postgres e Redis publicados em
`DB_PORT` e `REDIS_PORT`, para desenvolver) e `docker-compose.prod.yml` (aplicação + banco, usado
pelo CD). Os dois leem hosts e portas do `.env`.

Redeploy manual de uma versão já publicada, na VPS:

```bash
export IMAGE_TAG=<sha>
docker compose -f docker-compose.prod.yml pull app
docker compose -f docker-compose.prod.yml run --rm --no-deps app yarn migration:run:prod
docker compose -f docker-compose.prod.yml up -d app
```

`yarn migration:revert:prod` desfaz uma migration por execução; `yarn migration:show:prod` lista o
que está aplicado.

## Arquitetura

```
src/
  config/             app.config.ts (ValidationPipe 422, Swagger, CORS, versionamento), typeorm.config.ts
  env-config/         validação de ambiente no boot (módulo global)
  modules/<feature>/  controller + service + dto + entities + repositories
  shared/
    tokens.ts                  constantes dos tokens de DI
    dto/, validators/, utils/  DTOs e validadores reaproveitados entre módulos
    infra/typeorm/             BaseEntity, BaseTypeOrmRepository, migrations
    providers/http/            cliente HTTP com timeout, retry com backoff e tradução de erro
    providers/base/            UpstreamHttpProvider (URL, api_key, redação da chave)
    providers/cache/           Redis com `getOrSet` e invalidação por prefixo via SCAN
    providers/scheduler/       @ScheduledTask descoberto via DiscoveryModule
    providers/<upstream>/      um provider por API da NASA
```

**Padrão provider/interface:** toda dependência externa é uma interface injetada por token string de
`src/shared/tokens.ts`; as implementações ficam em `implementation/` e são ligadas no módulo. Trocar
de implementação mexe só na ligação do módulo. Em compensação, **todo token precisa de mock nos
specs** — um token novo quebra os `Test.createTestingModule` existentes.

**Entidades híbridas:** cada tabela tem colunas tipadas apenas para o que é consultado (chave
natural, datas, flags) mais um `payload jsonb` com o registro completo. Mapear os payloads da NASA
coluna a coluna geraria centenas de colunas que quebram a cada mudança upstream.

**Agendamento:** anote um método de qualquer provider com
`@ScheduledTask({ name, cron })` — nenhuma alteração de módulo é necessária. Os timers são
destruídos no shutdown (`app.enableShutdownHooks()` em `app.config.ts`).

**Ao criar um módulo novo:** registre a entidade no array `entities` de `src/config/typeorm.config.ts`
(não há autoload por glob) e o módulo em `src/app.module.ts`.

## Ressalvas

- `node-cron` agenda dentro do processo: com N réplicas, cada task roda N vezes. `noOverlap: true`
  protege só dentro do processo. Um lock distribuído usaria o `distributed`/`runCoordinator` do
  node-cron 4.x sobre o Redis já presente.
- `JWT_SECRET`/`JWT_EXPIRES_IN` não existem: não há autenticação, e o bloco `addBearerAuth` em
  `app.config.ts` segue comentado de propósito.
- `GET /v1/ssd/scout` e `GET /v1/ssd/mission-design` ficam só em cache: o primeiro é reescrito a cada
  minuto e o segundo é calculado a partir dos parâmetros da query.
