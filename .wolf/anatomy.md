# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-10-06T12:01:28.355Z
> Files: 281 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitattributes` — Git attributes (~18 tok)
- `.gitignore` — Git ignore rules (~207 tok)
- `.prettierrc` — Prettier configuration (~33 tok)
- `CLAUDE.md` — OpenWolf (~2304 tok)
- `docker-compose.yml` — Docker Compose services (~328 tok)
- `dockerfile` — Primeiro instala depednencias e builda a aplicação (~154 tok)
- `eslint.config.mjs` — ESLint flat configuration (~374 tok)
- `nest-cli.json` (~49 tok)
- `package.json` — Node.js package manifest (~875 tok)
- `README.md` — Project documentation (~2020 tok)
- `tsconfig.build.json` — TypeScript build configuration (~28 tok)
- `tsconfig.eslint.json` — /*", "tests/**/*", "eslint.config.mjs"] (~45 tok)
- `tsconfig.json` — TypeScript configuration (~281 tok)

## .claude/

- `settings.json` (~514 tok)

## .claude/commands/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .claude/rules/

- `openwolf.md` (~328 tok)

## .github/workflows/

- `ci.yml` — CI: CI (~547 tok)

## src/

- `app.module.ts` — Exports AppModule (~463 tok)
- `main.ts` — Declares bootstrap; fora de produção (NODE_ENV) loga a URL do Swagger /api-docs (~190 tok)

## src/config/

- `app.config.ts` — Exports appConfig (~523 tok)
  - fn `appConfig` L6-58 (~436 tok)
- `typeorm.config.ts` — Exports entities, typeOrmConfig (~648 tok)

## src/env-config/

- `env-config.module.ts` — Exports EnvConfigModule (~116 tok)
- `env-config.service.spec.ts` — Declares mockEnvValues (~795 tok)
- `env-config.service.ts` — Exports ENV_VARIABLE, EnvVariable, EnvConfigService (~330 tok)

## src/interceptor/

- `logger.interceptor.spec.ts` — Declares mockRequest (~1258 tok)
- `logger.interceptor.ts` — Exports LoggerInterceptor (~366 tok)

## src/modules/apod/

- `apod.controller.spec.ts` — Declares apod (~609 tok)
- `apod.controller.ts` — Exports ApodController (~487 tok)
- `apod.module.ts` — Exports ApodModule (~236 tok)
- `apod.service.spec.ts` — Declares apodFromApi (~1879 tok)
- `apod.service.ts` — Exports ApodService (~1291 tok)
  - class `ApodService` L16-124 (~1050 tok)

## src/modules/apod/dto/

- `apod-date-param.dto.ts` — Exports ApodDateParamDto (~92 tok)
- `apod-date-range.dto.ts` — Exports APOD_MAX_RANGE_DAYS, ApodDateRangeDto (~233 tok)
- `apod-random.dto.ts` — Exports APOD_MAX_RANDOM_QUANTITY, ApodRandomQueryDto (~156 tok)
- `apod-response.dto.ts` — Exports ApodResponseDto (~281 tok)

## src/modules/apod/entities/

- `apod.entity.ts` — Exports ApodEntity (~268 tok)

## src/modules/apod/repositories/

- `apod-repository.interface.ts` — Exports IApodRepository (~119 tok)

## src/modules/apod/repositories/typeorm/

- `typeorm-apod.repository.spec.ts` — Declares apod (~786 tok)
- `typeorm-apod.repository.ts` — Exports TypeOrmApodRepository (~394 tok)

## src/modules/donki/

- `donki.controller.ts` — Exports DonkiController (~991 tok)
  - class `DonkiController` L15-96 (~848 tok)
- `donki.module.ts` — Exports DonkiModule (~255 tok)
- `donki.service.spec.ts` — Declares cmeEvent (~1123 tok)
- `donki.service.ts` — Exports DonkiService (~1552 tok)
  - class `DonkiService` L36-135 (~1080 tok)

## src/modules/donki/dto/

- `donki-query.dto.ts` — Exports DONKI_MAX_RANGE_DAYS, DONKI_CME_CATALOGS, DONKI_IPS_LOCATIONS, DONKI_NOTIFICATION_TYPES + 4 more (~733 tok)
  - class `DonkiQueryDto` L13-26 (~168 tok)
  - class `DonkiCmeAnalysisQueryDto` L27-53 (~198 tok)
  - class `DonkiIpsQueryDto` L54-65 (~108 tok)
  - class `DonkiNotificationsQueryDto` L66-72 (~62 tok)

## src/modules/donki/entities/

- `donki-event.entity.ts` — Exports DonkiEventEntity (~203 tok)

## src/modules/donki/repositories/

- `donki-repository.interface.ts` — Exports IDonkiRepository (~95 tok)

## src/modules/donki/repositories/typeorm/

- `typeorm-donki.repository.ts` — Exports TypeOrmDonkiRepository (~387 tok)

## src/modules/eonet/

- `eonet.controller.ts` — Exports EonetController (~554 tok)
  - class `EonetController` L15-54 (~398 tok)
- `eonet.module.ts` — Exports EonetModule (~255 tok)
- `eonet.service.spec.ts` — Declares event (~1242 tok)
- `eonet.service.ts` — Exports EonetService (~1146 tok)
  - class `EonetService` L21-99 (~879 tok)

## src/modules/eonet/dto/

- `eonet-category-param.dto.ts` — Exports EonetCategoryParamDto (~106 tok)
- `eonet-events-query.dto.ts` — Exports EONET_STATUSES, EonetStatus, EonetEventsQueryDto (~325 tok)

## src/modules/eonet/entities/

- `eonet-event.entity.ts` — Exports EonetEventEntity (~275 tok)

## src/modules/eonet/repositories/

- `eonet-repository.interface.ts` — Exports EonetEventFilters, IEonetRepository (~140 tok)

## src/modules/eonet/repositories/typeorm/

- `typeorm-eonet.repository.ts` — Exports TypeOrmEonetRepository (~528 tok)
  - class `TypeOrmEonetRepository` L10-46 (~392 tok)

## src/modules/epic/

- `epic.controller.ts` — Exports EpicController (~407 tok)
- `epic.module.ts` — Exports EpicModule (~250 tok)
- `epic.service.spec.ts` — Declares image (~1187 tok)
- `epic.service.ts` — Exports EpicImageDto, EpicService (~1359 tok)
  - section `EpicImageDto` L14-18 (~26 tok)
  - class `EpicService` L19-119 (~1108 tok)

## src/modules/epic/dto/

- `epic-collection-param.dto.ts` — Exports EpicCollectionParamDto, EpicDateParamDto (~210 tok)

## src/modules/epic/entities/

- `epic-image.entity.ts` — Exports EpicImageEntity (~247 tok)

## src/modules/epic/repositories/

- `epic-repository.interface.ts` — Exports IEpicRepository (~121 tok)

## src/modules/epic/repositories/typeorm/

- `typeorm-epic.repository.ts` — Exports TypeOrmEpicRepository (~529 tok)
  - class `TypeOrmEpicRepository` L9-49 (~415 tok)

## src/modules/exoplanets/

- `exoplanets.controller.ts` — Exports ExoplanetsController (~306 tok)
- `exoplanets.module.ts` — Exports ExoplanetsModule (~276 tok)
- `exoplanets.service.spec.ts` — Declares module (~862 tok)
- `exoplanets.service.ts` — Exports ExoplanetsService (~1292 tok)
  - class `ExoplanetsService` L17-118 (~1031 tok)

## src/modules/exoplanets/dto/

- `exoplanet-query.dto.ts` — Exports ExoplanetQueryDto (~595 tok)
  - class `ExoplanetQueryDto` L6-69 (~506 tok)

## src/modules/exoplanets/entities/

- `exoplanet.entity.ts` — Exports ExoplanetEntity (~237 tok)

## src/modules/exoplanets/repositories/

- `exoplanet-repository.interface.ts` — Exports IExoplanetRepository (~83 tok)

## src/modules/exoplanets/repositories/typeorm/

- `typeorm-exoplanet.repository.ts` — Exports TypeOrmExoplanetRepository (~287 tok)

## src/modules/mars-weather/

- `mars-weather.controller.ts` — Exports MarsWeatherController (~304 tok)
- `mars-weather.module.ts` — Exports MarsWeatherModule (~290 tok)
- `mars-weather.service.spec.ts` — Declares upstreamResponse (~1245 tok)
- `mars-weather.service.ts` — Exports MarsSolDto, MarsWeatherService (~1179 tok)
  - section `MarsSolDto` L19-23 (~25 tok)
  - class `MarsWeatherService` L24-109 (~893 tok)

## src/modules/mars-weather/dto/

- `mars-sol-param.dto.ts` — Exports MarsSolParamDto (~104 tok)

## src/modules/mars-weather/entities/

- `mars-weather-sol.entity.ts` — Exports MarsWeatherSolEntity (~240 tok)

## src/modules/mars-weather/repositories/

- `mars-weather-repository.interface.ts` — Exports IMarsWeatherRepository (~106 tok)

## src/modules/mars-weather/repositories/typeorm/

- `typeorm-mars-weather.repository.ts` — Exports TypeOrmMarsWeatherRepository (~342 tok)

## src/modules/media/

- `media.controller.ts` — Exports MediaController (~534 tok)
  - class `MediaController` L14-46 (~377 tok)
- `media.module.ts` — Exports MediaModule (~255 tok)
- `media.service.spec.ts` — Declares searchResponse (~1067 tok)
  - fn `searchResponse` L11-99 (~884 tok)
- `media.service.ts` — Exports MediaService (~924 tok)
  - class `MediaService` L18-86 (~713 tok)

## src/modules/media/dto/

- `media-id-param.dto.ts` — Exports MediaIdParamDto (~101 tok)
- `media-search-query.dto.ts` — Exports MediaSearchQueryDto (~479 tok)

## src/modules/media/entities/

- `media-asset.entity.ts` — Exports MediaAssetEntity (~312 tok)

## src/modules/media/repositories/

- `media-repository.interface.ts` — Exports IMediaRepository (~83 tok)

## src/modules/media/repositories/typeorm/

- `typeorm-media.repository.ts` — Exports TypeOrmMediaRepository (~282 tok)

## src/modules/neo/

- `neo.controller.ts` — Exports NeoController (~464 tok)
- `neo.module.ts` — Exports NeoModule (~269 tok)
- `neo.service.spec.ts` — Declares neoObject (~1257 tok)
- `neo.service.ts` — Exports NeoService (~1671 tok)
  - class `NeoService` L20-142 (~1417 tok)

## src/modules/neo/dto/

- `neo-feed-query.dto.ts` — Exports NEO_FEED_MAX_RANGE_DAYS, NeoFeedQueryDto (~244 tok)
- `neo-id-param.dto.ts` — Exports NeoIdParamDto (~87 tok)

## src/modules/neo/entities/

- `neo-feed-day.entity.ts` — Exports NeoFeedDayEntity (~156 tok)
- `neo-object.entity.ts` — Exports NeoObjectEntity (~248 tok)

## src/modules/neo/repositories/

- `neo-repository.interface.ts` — Exports INeoRepository (~176 tok)

## src/modules/neo/repositories/typeorm/

- `typeorm-neo.repository.ts` — Exports TypeOrmNeoRepository (~581 tok)
  - class `TypeOrmNeoRepository` L10-54 (~444 tok)

## src/modules/ssd/

- `ssd.controller.ts` — Exports SsdController (~659 tok)
  - class `SsdController` L15-61 (~509 tok)
- `ssd.module.ts` — Exports SsdModule (~313 tok)
- `ssd.service.spec.ts` — Declares module (~1221 tok)
- `ssd.service.ts` — Exports SsdService (~1992 tok)
  - class `SsdService` L21-181 (~1751 tok)

## src/modules/ssd/dto/

- `ssd-query.dto.ts` — Exports SsdCloseApproachQueryDto, SsdFireballQueryDto, SsdSentryQueryDto, SSD_MISSION_DESIGN_CLASSES, SsdMissionDesignQueryDto (~959 tok)
  - class `SsdCloseApproachQueryDto` L6-36 (~339 tok)
  - class `SsdFireballQueryDto` L37-57 (~196 tok)
  - class `SsdSentryQueryDto` L58-82 (~220 tok)
  - class `SsdMissionDesignQueryDto` L83-94 (~124 tok)

## src/modules/ssd/entities/

- `ssd-close-approach.entity.ts` — Exports SsdCloseApproachEntity (~216 tok)
- `ssd-fireball.entity.ts` — Exports SsdFireballEntity (~216 tok)
- `ssd-sentry-object.entity.ts` — Exports SsdSentryObjectEntity (~220 tok)

## src/modules/ssd/repositories/

- `ssd-repository.interface.ts` — Exports ISsdRepository (~159 tok)

## src/modules/ssd/repositories/typeorm/

- `typeorm-ssd.repository.ts` — Exports TypeOrmSsdRepository (~536 tok)
  - class `TypeOrmSsdRepository` L10-44 (~400 tok)

## src/modules/tech-transfer/

- `tech-transfer.controller.ts` — Exports TechTransferController (~520 tok)
  - class `TechTransferController` L10-42 (~382 tok)
- `tech-transfer.module.ts` — Exports TechTransferModule (~297 tok)
- `tech-transfer.service.spec.ts` — Declares item (~817 tok)
- `tech-transfer.service.ts` — Exports TechTransferService (~696 tok)
  - class `TechTransferService` L18-60 (~464 tok)

## src/modules/tech-transfer/dto/

- `tech-transfer-query.dto.ts` — Exports TechTransferQueryDto (~98 tok)

## src/modules/tech-transfer/entities/

- `tech-transfer-item.entity.ts` — Exports TechTransferItemEntity (~244 tok)

## src/modules/tech-transfer/repositories/

- `tech-transfer-repository.interface.ts` — Exports ITechTransferRepository (~71 tok)

## src/modules/tech-transfer/repositories/typeorm/

- `typeorm-tech-transfer.repository.ts` — Exports TypeOrmTechTransferRepository (~266 tok)

## src/modules/techport/

- `techport.controller.ts` — Exports TechportController (~378 tok)
- `techport.module.ts` — Exports TechportModule (~274 tok)
- `techport.service.spec.ts` — Declares module (~1027 tok)
- `techport.service.ts` — Exports TechportService (~1237 tok)
  - class `TechportService` L21-115 (~958 tok)

## src/modules/techport/dto/

- `techport-query.dto.ts` — Exports TechportProjectsQueryDto, TechportProjectParamDto (~222 tok)

## src/modules/techport/entities/

- `techport-project.entity.ts` — Exports TechportProjectEntity (~257 tok)

## src/modules/techport/repositories/

- `techport-repository.interface.ts` — Exports ITechportRepository (~107 tok)

## src/modules/techport/repositories/typeorm/

- `typeorm-techport.repository.ts` — Exports TypeOrmTechportRepository (~375 tok)

## src/modules/tle/

- `tle.controller.ts` — Exports TleController (~356 tok)
- `tle.module.ts` — Exports TleModule (~245 tok)
- `tle.service.spec.ts` — Declares record (~914 tok)
- `tle.service.ts` — Exports TleService (~1004 tok)
  - class `TleService` L16-93 (~773 tok)

## src/modules/tle/dto/

- `tle-id-param.dto.ts` — Exports TleIdParamDto (~106 tok)
- `tle-search-query.dto.ts` — Exports TleSearchQueryDto (~220 tok)

## src/modules/tle/entities/

- `tle-record.entity.ts` — Exports TleRecordEntity (~182 tok)

## src/modules/tle/repositories/

- `tle-repository.interface.ts` — Exports ITleRepository (~104 tok)

## src/modules/tle/repositories/typeorm/

- `typeorm-tle.repository.ts` — Exports TypeOrmTleRepository (~436 tok)

## src/shared/

- `tokens.ts` — Exports HTTP_CLIENT_PROVIDER, CACHE_PROVIDER, SCHEDULER_PROVIDER, NASA_PROVIDER + 23 more (~398 tok)

## src/shared/dto/

- `date-range-query.dto.ts` — Exports DateRangeQueryDto (~238 tok)
- `pagination-query.dto.ts` — Exports PaginationQueryDto (~166 tok)

## src/shared/infra/typeorm/entities/

- `base.entity.ts` — Declares BaseEntity (~90 tok)

## src/shared/infra/typeorm/migrations/

- `.gitkeep` (~0 tok)
- `1789200000000-EnableUuidExtension.ts` — Exports EnableUuidExtension1789200000000 (~138 tok)
- `1789200001000-CreateApods.ts` — Exports CreateApods1789200001000 (~452 tok)
- `1789200002000-CreateNeoObjects.ts` — Exports CreateNeoObjects1789200002000 (~459 tok)
- `1789200003000-CreateNeoFeedDays.ts` — Exports CreateNeoFeedDays1789200003000 (~359 tok)
- `1789200004000-CreateDonkiEvents.ts` — Exports CreateDonkiEvents1789200004000 (~392 tok)
- `1789200005000-CreateEpicImages.ts` — Exports CreateEpicImages1789200005000 (~444 tok)
- `1789200006000-CreateEonetEvents.ts` — Exports CreateEonetEvents1789200006000 (~522 tok)
  - class `CreateEonetEvents1789200006000` L4-46 (~484 tok)
- `1789200007000-CreateMarsWeatherSols.ts` — Exports CreateMarsWeatherSols1789200007000 (~397 tok)
- `1789200008000-CreateMediaAssets.ts` — Exports CreateMediaAssets1789200008000 (~552 tok)
  - class `CreateMediaAssets1789200008000` L4-41 (~514 tok)
- `1789200009000-CreateTechTransferItems.ts` — Exports CreateTechTransferItems1789200009000 (~455 tok)
- `1789200010000-CreateTleRecords.ts` — Exports CreateTleRecords1789200010000 (~406 tok)
- `1789200011000-CreateSsdCloseApproaches.ts` — Exports CreateSsdCloseApproaches1789200011000 (~446 tok)
- `1789200012000-CreateSsdFireballs.ts` — Exports CreateSsdFireballs1789200012000 (~421 tok)
- `1789200013000-CreateSsdSentryObjects.ts` — Exports CreateSsdSentryObjects1789200013000 (~450 tok)
- `1789200014000-CreateTechportProjects.ts` — Exports CreateTechportProjects1789200014000 (~484 tok)
- `1789200015000-CreateExoplanets.ts` — Exports CreateExoplanets1789200015000 (~420 tok)

## src/shared/infra/typeorm/migrations/helpers/

- `base-columns.ts` — Exports baseColumns (~142 tok)

## src/shared/infra/typeorm/repositories/

- `base-typeorm.repository.ts` — Declares BaseTypeOrmRepository (~272 tok)

## src/shared/providers/base/

- `upstream-http.provider.ts` — Declares UpstreamHttpProvider (~368 tok)

## src/shared/providers/cache/

- `cache.module.ts` — Exports CacheModule (~103 tok)

## src/shared/providers/cache/implementation/

- `redis-provider.ts` — Exports RedisCacheProvider (~583 tok)
  - class `RedisCacheProvider` L9-70 (~510 tok)

## src/shared/providers/cache/models/

- `cache-provider.interface.ts` — Exports ICacheProvider (~95 tok)

## src/shared/providers/donki/

- `donki.module.ts` — Exports DonkiModule (~100 tok)

## src/shared/providers/donki/implementation/

- `donki-provider.ts` — Exports DonkiProvider (~463 tok)

## src/shared/providers/donki/models/

- `donki-provider.interface.ts` — Exports IDonkiProvider (~61 tok)
- `donki-response.interface.ts` — Exports DONKI_EVENT_PATHS, DONKI_EVENT_TYPES, DonkiEventType, DonkiEvent, DonkiQuery (~202 tok)

## src/shared/providers/eonet/

- `eonet.module.ts` — Exports EonetModule (~100 tok)

## src/shared/providers/eonet/implementation/

- `eonet-provider.ts` — Exports EonetProvider (~556 tok)
  - class `EonetProvider` L11-46 (~384 tok)

## src/shared/providers/eonet/models/

- `eonet-provider.interface.ts` — Exports EonetEventsQuery, IEonetProvider (~136 tok)
- `eonet-response.interface.ts` — Exports EonetCategoryRef, EonetSourceRef, EonetGeometry, EonetEvent + 3 more (~279 tok)

## src/shared/providers/epic/

- `epic.module.ts` — Exports EpicModule (~98 tok)

## src/shared/providers/epic/implementation/

- `epic-provider.ts` — Exports EpicProvider (~520 tok)
  - class `EpicProvider` L13-40 (~340 tok)

## src/shared/providers/epic/models/

- `epic-provider.interface.ts` — Exports IEpicProvider (~118 tok)
- `epic-response.interface.ts` — Exports EPIC_COLLECTIONS, EpicCollection, EpicCoordinates, EpicVector + 2 more (~194 tok)

## src/shared/providers/exoplanet/

- `exoplanet.module.ts` — Exports ExoplanetModule (~108 tok)

## src/shared/providers/exoplanet/implementation/

- `exoplanet-provider.spec.ts` — Declares lastAdql (~737 tok)
- `exoplanet-provider.ts` — Exports ExoplanetProvider (~919 tok)
  - class `ExoplanetProvider` L23-90 (~674 tok)

## src/shared/providers/exoplanet/models/

- `exoplanet-provider.interface.ts` — Exports IExoplanetProvider (~53 tok)
- `exoplanet-response.interface.ts` — Exports EXOPLANET_COLUMNS, ExoplanetColumn, EXOPLANET_TABLE, ExoplanetRow + 2 more (~222 tok)

## src/shared/providers/http/

- `http.module.ts` — Exports HttpClientModule (~114 tok)

## src/shared/providers/http/implementation/

- `axios-http-client.spec.ts` — API routes: GET (8 endpoints) (~1062 tok)
  - fn `axiosErrorWithStatus` L10-96 (~976 tok)
- `axios-http-client.ts` — Exports AxiosHttpClient (~1273 tok)
  - class `AxiosHttpClient` L24-136 (~1120 tok)

## src/shared/providers/http/models/

- `http-client-provider.interface.ts` — Exports HttpQueryParams, HttpRequestOptions, IHttpClientProvider (~108 tok)

## src/shared/providers/mars-weather/

- `mars-weather.module.ts` — Exports MarsWeatherModule (~114 tok)

## src/shared/providers/mars-weather/implementation/

- `mars-weather-provider.ts` — Exports MarsWeatherProvider (~335 tok)

## src/shared/providers/mars-weather/models/

- `mars-weather-provider.interface.ts` — Exports IMarsWeatherProvider (~48 tok)
- `mars-weather-response.interface.ts` — Exports MarsSensorSummary, MarsSolSummary, MarsWeatherResponse (~153 tok)

## src/shared/providers/media/

- `media.module.ts` — Exports MediaModule (~100 tok)

## src/shared/providers/media/implementation/

- `media-provider.ts` — Exports MediaProvider (~570 tok)
  - class `MediaProvider` L11-45 (~403 tok)

## src/shared/providers/media/models/

- `media-provider.interface.ts` — Exports MediaSearchQuery, IMediaProvider (~173 tok)
- `media-response.interface.ts` — Exports MEDIA_TYPES, MediaType, MediaItemData, MediaItemLink + 3 more (~261 tok)

## src/shared/providers/nasa/

- `nasa.module.ts` — Exports NasaModule (~106 tok)

## src/shared/providers/nasa/implementation/

- `apod-wordpress.provider.spec.ts` — Declares payload (~1068 tok)
  - fn `payload` L8-98 (~961 tok)
- `apod-wordpress.provider.ts` — Exports ApodWordPressProvider (~1096 tok)
  - class `ApodWordPressProvider` L18-101 (~853 tok)
- `nasa-provider.ts` — Exports NasaProvider (~488 tok)

## src/shared/providers/nasa/mappers/

- `apod.mapper.ts` — Exports mapWordPressApod (~312 tok)

## src/shared/providers/nasa/models/

- `apod-response.interface.ts` — Exports ApodResponse (~73 tok)
- `nasa-provider.interface.ts` — Exports INasaProvider (~87 tok)
- `wordpress-apod.interface.ts` — Exports WordPressApodPayload (~94 tok)

## src/shared/providers/neo/

- `neo.module.ts` — Exports NeoModule (~96 tok)

## src/shared/providers/neo/implementation/

- `neo-provider.ts` — Exports NeoProvider (~423 tok)

## src/shared/providers/neo/models/

- `neo-provider.interface.ts` — Exports INeoProvider (~94 tok)
- `neo-response.interface.ts` — Exports NeoEstimatedDiameterRange, NeoCloseApproach, NeoObject, NeoFeedResponse, NeoBrowseResponse (~303 tok)

## src/shared/providers/scheduler/

- `scheduler-runner.service.ts` — Exports SchedulerRunnerService (~590 tok)
  - class `SchedulerRunnerService` L13-60 (~446 tok)
- `scheduler.module.ts` — Exports SchedulerModule (~156 tok)

## src/shared/providers/scheduler/decorators/

- `scheduled-task.decorator.ts` — Exports SCHEDULED_TASK_METADATA, ScheduledTask (~90 tok)

## src/shared/providers/scheduler/implementations/

- `cron-provider.ts` — Exports CronProvider (~330 tok)

## src/shared/providers/scheduler/models/

- `scheduler-provider.interface.ts` — Exports ISchedulerProvider (~37 tok)
- `task.interface.ts` — Exports ITask, ScheduledTaskOptions (~47 tok)

## src/shared/providers/ssd/

- `ssd.module.ts` — Exports SsdModule (~96 tok)

## src/shared/providers/ssd/implementation/

- `ssd-provider.ts` — Exports SsdProvider (~668 tok)
  - class `SsdProvider` L17-65 (~490 tok)

## src/shared/providers/ssd/models/

- `ssd-provider.interface.ts` — Exports ISsdProvider (~158 tok)
- `ssd-response.interface.ts` — Exports SsdTableResponse, SsdSentryResponse, SsdCadQuery, SsdFireballQuery, SsdSentryQuery (~194 tok)

## src/shared/providers/tech-transfer/

- `tech-transfer.module.ts` — Exports TechTransferModule (~116 tok)

## src/shared/providers/tech-transfer/implementation/

- `tech-transfer-provider.ts` — Exports TechTransferProvider (~734 tok)
  - section `RawTechTransferResponse` L24-32 (~45 tok)
  - class `TechTransferProvider` L33-74 (~475 tok)

## src/shared/providers/tech-transfer/models/

- `tech-transfer-provider.interface.ts` — Exports ITechTransferProvider (~66 tok)
- `tech-transfer-response.interface.ts` — Exports TECH_TRANSFER_CATEGORIES, TechTransferCategory, TechTransferItem, TechTransferResult (~151 tok)

## src/shared/providers/techport/

- `techport.module.ts` — Exports TechportModule (~106 tok)

## src/shared/providers/techport/implementation/

- `techport-provider.ts` — Exports TechportProvider (~416 tok)

## src/shared/providers/techport/models/

- `techport-provider.interface.ts` — Exports ITechportProvider (~78 tok)
- `techport-response.interface.ts` — Exports TechportProjectRef, TechportProjectsResponse, TechportProject, TechportProjectResponse (~149 tok)

## src/shared/providers/tle/

- `tle.module.ts` — Exports TleModule (~96 tok)

## src/shared/providers/tle/implementation/

- `tle-provider.ts` — Exports TleProvider (~376 tok)

## src/shared/providers/tle/models/

- `tle-provider.interface.ts` — Exports ITleProvider (~77 tok)
- `tle-response.interface.ts` — Exports TleRecord, TleCollection (~62 tok)

## src/shared/testing/

- `cache-provider.mock.ts` — Exports createCacheProviderMock (~134 tok)

## src/shared/utils/

- `date.util.ts` — Exports toIsoDate, countDaysBetween, addDays (~119 tok)
- `sanitize.util.spec.ts` — Declares payload (~283 tok)
- `sanitize.util.ts` — Exports redactApiKey (~185 tok)

## src/shared/validators/

- `is-after-or-equal.validator.ts` — Exports IsAfterOrEqual (~382 tok)
- `max-date-range.validator.ts` — Exports MaxDateRange (~447 tok)

## src/utils/

- `types.ts` — Exports ObjectValues (~12 tok)

## tests/

- `jest-e2e.json` (~147 tok)
- `jest-integration.json` (~150 tok)
- `jest-smoke.json` (~124 tok)

## tests/e2e/modules/apod/

- `apod.e2e-spec.ts` — API routes: GET (13 endpoints) (~1326 tok)

## tests/e2e/modules/donki/

- `donki.e2e-spec.ts` — API routes: GET (10 endpoints) (~1067 tok)

## tests/e2e/modules/eonet/

- `eonet.e2e-spec.ts` — API routes: GET (10 endpoints) (~1029 tok)

## tests/e2e/modules/epic/

- `epic.e2e-spec.ts` — API routes: GET (7 endpoints) (~772 tok)

## tests/e2e/modules/exoplanets/

- `exoplanets.e2e-spec.ts` — API routes: GET (5 endpoints) (~566 tok)

## tests/e2e/modules/mars-weather/

- `mars-weather.e2e-spec.ts` — API routes: GET (7 endpoints) (~849 tok)

## tests/e2e/modules/media/

- `media.e2e-spec.ts` — API routes: GET (10 endpoints) (~1003 tok)

## tests/e2e/modules/neo/

- `neo.e2e-spec.ts` — API routes: GET (10 endpoints) (~1164 tok)

## tests/e2e/modules/ssd/

- `ssd.e2e-spec.ts` — API routes: GET (8 endpoints) (~954 tok)

## tests/e2e/modules/tech-transfer/

- `tech-transfer.e2e-spec.ts` — API routes: GET (4 endpoints) (~742 tok)

## tests/e2e/modules/techport/

- `techport.e2e-spec.ts` — API routes: GET (7 endpoints) (~682 tok)

## tests/e2e/modules/tle/

- `tle.e2e-spec.ts` — API routes: GET (5 endpoints) (~588 tok)

## tests/integration/modules/apod/

- `typeorm-apod.repository.integration-spec.ts` — Declares apod (~1151 tok)

## tests/integration/modules/donki/

- `typeorm-donki.repository.integration-spec.ts` — Declares donkiEvent (~971 tok)

## tests/integration/modules/eonet/

- `typeorm-eonet.repository.integration-spec.ts` — Declares event (~1115 tok)

## tests/integration/modules/epic/

- `typeorm-epic.repository.integration-spec.ts` — Declares image (~966 tok)

## tests/integration/modules/exoplanets/

- `typeorm-exoplanet.repository.integration-spec.ts` — Declares planet (~717 tok)

## tests/integration/modules/mars-weather/

- `typeorm-mars-weather.repository.integration-spec.ts` — Declares sol (~648 tok)

## tests/integration/modules/media/

- `typeorm-media.repository.integration-spec.ts` — Declares asset (~735 tok)

## tests/integration/modules/neo/

- `typeorm-neo.repository.integration-spec.ts` — Declares neoObject (~1536 tok)

## tests/integration/modules/ssd/

- `typeorm-ssd.repository.integration-spec.ts` — Declares approach (~1341 tok)

## tests/integration/modules/tech-transfer/

- `typeorm-tech-transfer.repository.integration-spec.ts` — Declares item (~663 tok)

## tests/integration/modules/techport/

- `typeorm-techport.repository.integration-spec.ts` — Declares stored (~744 tok)

## tests/integration/modules/tle/

- `typeorm-tle.repository.integration-spec.ts` — Declares record (~802 tok)

## tests/integration/shared/providers/donki/

- `donki-provider.integration-spec.ts` — API routes: GET (4 endpoints) (~696 tok)

## tests/integration/shared/providers/eonet/

- `eonet-provider.integration-spec.ts` — API routes: GET (8 endpoints) (~808 tok)

## tests/integration/shared/providers/epic/

- `epic-provider.integration-spec.ts` — API routes: GET (4 endpoints) (~541 tok)

## tests/integration/shared/providers/exoplanet/

- `exoplanet-provider.integration-spec.ts` — API routes: GET (6 endpoints) (~852 tok)

## tests/integration/shared/providers/http/

- `axios-http-client.integration-spec.ts` — API routes: GET (8 endpoints) (~862 tok)

## tests/integration/shared/providers/mars-weather/

- `mars-weather-provider.integration-spec.ts` — API routes: GET (2 endpoints) (~458 tok)

## tests/integration/shared/providers/media/

- `media-provider.integration-spec.ts` — API routes: GET (4 endpoints) (~701 tok)

## tests/integration/shared/providers/nasa/

- `apod-wordpress.provider.integration-spec.ts` — API routes: GET (6 endpoints) (~1130 tok)
  - fn `payload` L5-109 (~1063 tok)

## tests/integration/shared/providers/neo/

- `neo-provider.integration-spec.ts` — API routes: GET (4 endpoints) (~761 tok)

## tests/integration/shared/providers/ssd/

- `ssd-provider.integration-spec.ts` — API routes: GET (4 endpoints) (~883 tok)

## tests/integration/shared/providers/tech-transfer/

- `tech-transfer-provider.integration-spec.ts` — API routes: GET (4 endpoints) (~808 tok)
  - fn `row` L5-89 (~739 tok)

## tests/integration/shared/providers/techport/

- `techport-provider.integration-spec.ts` — API routes: GET (3 endpoints) (~437 tok)

## tests/integration/shared/providers/tle/

- `tle-provider.integration-spec.ts` — API routes: GET (4 endpoints) (~552 tok)

## tests/smoke/modules/

- `nasa-upstreams.smoke-spec.ts` — Declares httpClient (~1895 tok)

## tests/support/

- `database.ts` — Exports TEST_DATABASE_NAME, testDataSourceOptions, ensureTestDatabase, createTestDataSource, truncate (~463 tok)
- `global-setup.ts` — Declares globalSetup (~89 tok)
- `in-memory-cache.ts` — Exports InMemoryCache (~367 tok)
- `smoke.ts` — Exports hasApiKey, describeSmoke, smokeHttpClient, smokeEnvConfigService (~159 tok)
- `test-app.ts` — Exports TestApp, createTestApp (~519 tok)
  - section `TestApp` L12-21 (~72 tok)
  - fn `createTestApp` L22-57 (~301 tok)
- `upstream-provider.ts` — Exports TEST_API_KEY, fakeEnvConfigService, buildProvider (~254 tok)
- `upstream-server.ts` — Exports UpstreamRequest, UpstreamServer (~911 tok)
  - section `UpstreamRequest` L4-8 (~26 tok)
  - section `Route` L9-16 (~38 tok)
  - class `UpstreamServer` L17-108 (~812 tok)
- `upstream-stub.ts` — Exports RecordedCall, UpstreamStub (~674 tok)
  - section `RecordedCall` L8-12 (~25 tok)
  - class `UpstreamStub` L13-81 (~592 tok)
