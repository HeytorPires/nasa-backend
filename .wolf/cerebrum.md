# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-09-02

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- **Shared nunca depende de feature module.** Ao planejar o scheduler o usuario rejeitou duas vezes propostas que amarravam o agendador ao APOD: "sem vinculo direto ao apod, vai ser usado para cron de outras entidades tambem". Codigo em `src/shared/` deve ser generico e descobrir/receber o que precisa, nunca importar de `src/modules/`.
- **Pede implementacao enxuta.** Depois de aprovar o plano do scheduler, o usuario pediu "deixe a implementacao mais simples" — o codigo tinha guardas que nenhum caso de uso real exigia (Set de nomes duplicados, skip de providers request-scoped, campos opcionais no `ITask`, metodo privado extra). Preferir o caminho minimo que resolve o caso concreto; nao adicionar defesa especulativa.
- **Prefere um servico orquestrador central a registro distribuido.** Quando existe a escolha entre cada componente se auto-registrar e um unico servico que enxerga e dispara todos, o usuario escolhe o servico central ("um servico em shared que chama os servicos que devem estar no schedule").

## Key Learnings

- **Scheduler:** `src/shared/providers/scheduler/` usa `DiscoveryService` + `MetadataScanner` + `Reflector` (`@nestjs/core`, `DiscoveryModule`) para descobrir metodos decorados com `@ScheduledTask({ name, cron })` no hook `onApplicationBootstrap`. Agendar algo novo = so por o decorator em um metodo de qualquer provider ja registrado; nao se edita o scheduler nem o `AppModule`. `SchedulerModule` fica importado apenas no `AppModule`, uma vez.
- **`DiscoveryService.getProviders({ metadataKey })` filtra metadata de CLASSE, nao de metodo.** Para metadata em metodos e preciso varrer o prototype com `MetadataScanner.getAllMethodNames()` e ler cada um com `Reflector.get(KEY, instance[methodName])`.
- **node-cron 4.6.0** tem default export (`nodeCron as default`), entao `import cron from "node-cron"` funciona com o `esModuleInterop` do projeto. O `TaskOptions` aceita `name`, `timezone` e `noOverlap` — o `CronProvider` fixa `timezone: "UTC"` (o `ApodService` normaliza todas as datas em UTC) e `noOverlap: true`, sem expor override no `ITask`.
- **Scripts ts-node de verificacao precisam morar dentro de `src/`.** O `rootDir: "./src"` do tsconfig faz qualquer arquivo fora dele falhar com TS2307 em todos os imports, inclusive os de `node_modules`.
- **Project:** nasa-api
- **Description:** <p align="center">

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

- **[2026-08-10] ORM: Prisma → TypeORM.** User asked to plan+execute full swap. Chosen: drop-and-recreate the `apods` table via a fresh TypeORM migration (existing Prisma-era data disposable, no baseline/backfill needed); `Repository<ApodEntity>` pattern (not QueryBuilder) since queries are simple find/count/create; Prisma removed completely (packages, `src/generated/prisma`, `src/modules/prisma`) rather than kept as fallback. The existing provider/interface pattern (`IApodRepository`) meant `ApodService` and the interface itself needed zero changes — only the repository implementation and module wiring changed.

- **[2026-09-02] Scheduler: DiscoveryService + decorator, nao classe base nem `forRoot`.** Tres opcoes foram apresentadas: (a) classe base abstrata `ScheduledTask` com auto-registro no `onModuleInit` de cada task, (b) `SchedulerModule.forRoot({ imports, tasks })` com registro explicito no `AppModule`, (c) `SchedulerRunnerService` em shared varrendo providers via `DiscoveryService` atras do decorator `@ScheduledTask`. Escolhida (c): satisfaz simultaneamente as duas exigencias do usuario — um servico central em shared que dispara tudo, e zero acoplamento com feature modules — e custa zero wiring por entidade nova. `@nestjs/schedule` foi descartado por acoplar ao decorator do pacote e descartar o `CronProvider`/`ISchedulerProvider` que ja seguiam o padrao interface+token do projeto.

## Key Learnings (2026-09-11 — expansão para todas as APIs da NASA)

- **A doc de api.nasa.gov está desatualizada em vários pontos; sempre sondar o endpoint real antes de codificar.** Verificado em 2026-09-11: APOD WordPress ignora `date`/`start_date`/`end_date`/`count`; `/techtransfer` devolve HTML; `/EPIC` é redirect para `epic.gsfc.nasa.gov`; Mars Rover Photos (404) e Earth Imagery (timeout) saíram do ar e nem constam mais da lista oficial.
- **A lista canônica de APIs da NASA está em `https://raw.githubusercontent.com/nasa/api-docs/gh-pages/assets/json/apis.json`** (16 entradas com o HTML da doc). A página api.nasa.gov é uma SPA e não rende nada para WebFetch.
- **Nem todo upstream aceita `api_key`.** EONET, images-api, TLE, SSD/JPL, TechPort e Exoplanet Archive são abertos e têm host próprio; só os caminhos sob `api.nasa.gov` usam a chave. Daí o `requiresApiKey` no `UpstreamHttpProvider`.
- **`@Index` do TypeORM só gera B-tree.** Índices GIN (`text[]` com `@>`, busca em `jsonb`) precisam ser escritos à mão na migration.
- **`uuid_generate_v4()` exige a extensão uuid-ossp**, que o TypeORM não cria sozinho — `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` no topo do `up()` da migration inicial.
- **`test/` fica fora do tsconfig principal** (`rootDir: ./src`), então o ESLint com checagem de tipos precisa de um `tsconfig.eslint.json` com `rootDir: "."` cobrindo src e test.
- **Schema híbrido para payloads de terceiros:** colunas tipadas só para o que é consultado (chave natural, datas, flags) mais `payload jsonb`. Mapear payload da NASA coluna a coluna geraria centenas de colunas que quebram a cada mudança upstream.
- **`upsert` com `conflictPaths` no lugar de "consulta + if (!existe) create".** Além de menos código, resolve no banco a corrida entre uma requisição do usuário e o cron sincronizando o mesmo registro.

## Do-Not-Repeat (continuação)

- **[2026-09-11] Nunca repassar payload cru de api.nasa.gov ao cliente.** A NeoWs devolve a `NASA_API_KEY` dentro dos campos `links`. Todo provider de api.nasa.gov deve passar por `UpstreamHttpProvider`, que aplica `redactApiKey`.
- **[2026-09-11] Nunca aceitar ADQL/SQL do cliente no módulo Exoplanet.** O TAP executa o que receber. Filtros são nomeados, a coluna sai da allowlist `EXOPLANET_COLUMNS`, o operador de um mapa fechado e os literais passam por escape.
- **[2026-09-11] Não usar `typeorm-ts-node-commonjs`** — não registra `tsconfig-paths` e o CLI quebra nos imports absolutos `src/...`.
- **[2026-09-11] Provider que agenda timers precisa destruí-los no shutdown.** Sem `OnApplicationShutdown` no `CronProvider` + `app.enableShutdownHooks()`, o processo e a suíte e2e nunca terminam.
- **[2026-09-11] Teste e2e que depende do banco precisa limpar as tabelas que o serviço lê antes do upstream.** O `EonetService` devolveu dados reais de um smoke test anterior em vez do stub.

## Decision Log (continuação)

- **[2026-09-11] Cobertura completa das APIs REST/JSON da NASA (12 domínios).** Escopo definido com o usuário: núcleo REST/JSON, deixando de fora GIBS, Trek WMTS e Satellite Situation Center (WMTS/tiles/XML, não cabem no padrão provider/repository). Persistência em Postgres para todos os recursos, com duas exceções conscientes — `GET /v1/ssd/scout` (reescrito a cada minuto) e `GET /v1/ssd/mission-design` (calculado sob demanda) ficam só em cache.
- **[2026-09-11] Fundação compartilhada antes dos módulos.** `AxiosHttpClient` + `UpstreamHttpProvider` + `BaseEntity`/`BaseTypeOrmRepository` + `getOrSet` no cache + `src/shared/tokens.ts` foram escritos primeiro; sem isso cada um dos 11 módulos novos duplicaria axios cru, try/catch, o trio recover/if-null/save e o boilerplate de repositório.
- **[2026-09-11] Versionamento URI ativado de fato.** `enableVersioning` já estava ligado mas nenhum controller usava `version`. Todas as rotas passaram a `@Controller({ path, version: "1" })`; **mudança breaking**: `/apods/...` virou `/v1/apods/...`.
- **[2026-09-11] APOD migrado para a API WordPress agora**, não atrás de uma flag: o legado morre em 2026-12-01 e manter dois providers dobraria o código. `NasaProvider` fica no repositório como rollback, fora do `NasaModule`.
- **[2026-09-11] yarn como único gerenciador.** `package-lock.json` removido e adicionado ao `.gitignore`; o `dockerfile` já instalava com yarn.

## Key Learnings (2026-09-11 — migrations por tabela e arquitetura de testes)

- **`migration:generate` sair vazia é o critério de aceite de uma migration escrita à mão.** Se sair com conteúdo, entidade e migration divergiram — é o jeito mais barato de detectar isso.
- **Índice GIN no TypeORM exige as duas pontas:** SQL cru na migration (`TableIndex` não tem campo para o método) e `@Index("nome", { synchronize: false })` na entidade. Sem o decorator o CLI dropa o índice; com o decorator sem a flag, ele o converte em B-tree.
- **`queryRunner.dropTable(nome, true)` já remove os índices da tabela**, então o `down()` de uma migration de criação é uma linha.
- **`getRawMany` não passa pelo conversor de coluna do TypeORM.** Uma coluna `date` volta como `Date` do driver, deslocada pelo fuso local. Use `TO_CHAR(col, 'YYYY-MM-DD')` quando o resto do módulo trata datas como string.
- **`DataSourceOptions` é união de todos os drivers.** Espalhá-la (`{ ...typeOrmConfig, database: x }`) perde o discriminante `type`. Estreitar com `Extract<DataSourceOptions, { type: "postgres" }>` resolve.
- **O `globalSetup` do Jest roda fora do `moduleNameMapper`.** Ou registra-se `tsconfig-paths/register` nele, ou os arquivos de apoio importam `src/` por caminho relativo. Este projeto faz as duas coisas.
- **Um `DataSource` que só emite DDL administrativo deve declarar `entities: []` e `migrations: []`** — senão o TypeORM carrega os arquivos de migration e o ts-jest tenta compilar até os `.js` de `dist/`.
- **Banco de teste dedicado (`${DB_NAME}_test`) migrado pelo `globalSetup`** isola a suíte e transforma cada execução numa verificação das migrations. Melhor que `synchronize: true`, que nunca exercitaria o DDL que roda em produção.
- **Stub de upstream deve casar pelo trecho mais longo**, não pelo primeiro registrado, senão `/projects` rouba as chamadas de `/projects/93851`.
- **O guard de "resposta vazia" do cliente HTTP não pode rejeitar `null`:** é resposta legítima em alguns upstreams (o DONKI usa para "nenhum evento"). Só `undefined` e string vazia contam como corpo malformado.

## Do-Not-Repeat (continuação)

- **[2026-09-11] Não gerar migration monolítica pelo CLI e deixar assim.** O usuário pediu uma por tabela, com a API tipada do `QueryRunner` — não `queryRunner.query` com DDL concatenado.
- **[2026-09-11] Testes de integração/e2e nunca podem rodar contra o banco de desenvolvimento.** Eles truncam tabelas; use sempre `${DB_NAME}_test` via `tests/support/database.ts`.
- **[2026-09-11] `jest --forceExit` é remendo, não solução.** Se a suíte não termina, há handle aberto — no caso, os timers do `node-cron` sem `onApplicationShutdown`.

## Decision Log (continuação)

- **[2026-09-11] Migrations com granularidade de uma por tabela** (16 arquivos, contando a da extensão uuid-ossp), usando a API tipada do `QueryRunner`. Escolhido pelo usuário entre "uma por módulo" e "uma por tabela"; permite reverter uma tabela sem tocar nas irmãs do mesmo módulo.
- **[2026-09-11] `tests/` espelhando `src/`, com os unitários permanecendo colocados no código.** Unitários ao lado do que testam (feedback rápido, sem infraestrutura); integração, e2e e smoke em `tests/`, cada um com sua config de Jest e seu `testRegex`.
- **[2026-09-11] Integração cobre repositórios *e* providers.** Repositórios contra Postgres real (o `ON CONFLICT` do upsert e os filtros que dependem do dialeto não existem com `Repository` mockado); providers contra um servidor HTTP local, o que exercita o `AxiosHttpClient` de produção — query string, `api_key`, redação, retry, timeout.
- **[2026-09-11] Suíte smoke opcional contra a NASA real**, fora do CI, validando apenas a **forma** das respostas. Existe para pegar mudança de contrato nos upstreams, que é o tipo de quebra que já apareceu duas vezes neste projeto.

## User Preferences (2026-09-25)

- **Nenhum comentário explicativo no código (2026-10-06).** O usuário pediu para retirar todos: "o código por si só deve ser uma explicação". Em `src/` e `tests/` só ficam diretivas de ferramenta (`eslint-disable`, `@ts-*`) e o bloco `.addBearerAuth` comentado em `src/config/app.config.ts` (mantido por decisão dele). Conhecimento não óbvio (armadilhas de upstream, de banco) vai para `CLAUDE.md`, nunca para comentário. Ao escrever código novo, não acrescentar comentário algum.

## Key Learnings (2026-10-06)
- `NODE_ENV` é opcional e fica fora de `ENV_VARIABLE`, onde toda chave é obrigatória e derruba o boot se faltar. Qualquer valor diferente de `production`, inclusive ausente, conta como desenvolvimento. O `dockerfile` define `NODE_ENV=production`.
- Para remover comentários de `.ts` com segurança, use `ts.getLeadingCommentRanges`/`getTrailingCommentRanges` sobre a AST, nunca regex nem o scanner cru: `//` aparece em URLs e o scanner não rescaneia template literals sozinho.

## Decision Log (2026-10-06)
- O log do Swagger usa `http://localhost:${port}` em vez de `app.getUrl()`, que devolve `http://[::1]:PORT`.
- O Swagger continua montado em produção; só o log depende de `NODE_ENV`. Desligar `/api-docs` em produção ainda não foi decidido.

## Decision Log (2026-10-06 — CI/CD)
- CD segue o modelo do `HeytorPires/api-nimbus` (mesma VPS Oracle ARM): imagem construída no CI em `ubuntu-24.04-arm`, VPS só faz pull; compose chega por `git pull`; migrations rodam num container efêmero antes do `up -d`; rollback via `.last_deploy_tag`.
- Três melhorias sobre o nimbus: rollback reverte **todas** as migrations do deploy (conta `[X]` no `migration:show` antes/depois), Postgres/Redis sem portas publicadas em produção, healthcheck valida banco + Redis.
- O usuário preferiu **dois arquivos de compose** (`docker-compose.yml` dev, `docker-compose.prod.yml` VPS) a um arquivo único com profile ou override.

## Key Learnings (2026-10-06 — CI/CD)
- `ioredis` com o Redis fora não rejeita o `PING`: enfileira e reconecta, então qualquer checagem de saúde precisa de timeout próprio.
- `typeorm migration:show` sai com 0 mesmo havendo pendentes; só sai 1 em erro. Contar `[X]` é a forma de saber quantas foram aplicadas.
- Em zsh, `$C` com espaços não sofre word splitting: scripts de deploy usam função (`dc() { docker compose -f ... "$@"; }`), não variável.
- Container que sobe com falha de bind de porta fica sem port mapping mesmo depois de iniciado; exige `--force-recreate`.
- Um container `postgres-db` de outro projeto ocupa a 5432 nesta máquina; foi parado (não removido) em 2026-10-06.

## User Preferences (2026-10-06 — git)
- **Nunca commitar sem pedido explícito, igual ao push.** Plano aprovado, "pode continuar" ou pedido de commit em turno anterior não autorizam commit. Deixar as mudanças no working tree e reportar.

## Do-Not-Repeat (2026-10-06)
- Commitei 7 mudanças de CI/CD sozinho porque o plano aprovado tinha um passo "commitar sem push"; o usuário mandou desfazer (`git reset --mixed HEAD~7`). Não incluir passo de commit em plano sem o usuário pedir.
- CI: o usuário quer os steps de Node (setup-node, cache de node_modules, install) explícitos em cada job, não numa composite action; e o job unitário roda `yarn test --ci --coverage`.
- Composes leem DB_HOST/DB_PORT/REDIS_HOST/REDIS_PORT do .env; Postgres e Redis escutam na porta do .env (postgres -p, redis-server --port). Na VPS, DB_HOST=postgres e REDIS_HOST=redis (nomes dos serviços); localhost dentro do container da app é a própria app.
