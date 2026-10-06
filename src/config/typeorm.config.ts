import "dotenv/config";
import { join } from "path";
import { DataSource, DataSourceOptions } from "typeorm";

type PostgresDataSourceOptions = Extract<DataSourceOptions, { type: "postgres" }>;
import { ApodEntity } from "../modules/apod/entities/apod.entity";
import { DonkiEventEntity } from "../modules/donki/entities/donki-event.entity";
import { EonetEventEntity } from "../modules/eonet/entities/eonet-event.entity";
import { EpicImageEntity } from "../modules/epic/entities/epic-image.entity";
import { ExoplanetEntity } from "../modules/exoplanets/entities/exoplanet.entity";
import { MarsWeatherSolEntity } from "../modules/mars-weather/entities/mars-weather-sol.entity";
import { MediaAssetEntity } from "../modules/media/entities/media-asset.entity";
import { NeoFeedDayEntity } from "../modules/neo/entities/neo-feed-day.entity";
import { NeoObjectEntity } from "../modules/neo/entities/neo-object.entity";
import { SsdCloseApproachEntity } from "../modules/ssd/entities/ssd-close-approach.entity";
import { SsdFireballEntity } from "../modules/ssd/entities/ssd-fireball.entity";
import { SsdSentryObjectEntity } from "../modules/ssd/entities/ssd-sentry-object.entity";
import { TechTransferItemEntity } from "../modules/tech-transfer/entities/tech-transfer-item.entity";
import { TechportProjectEntity } from "../modules/techport/entities/techport-project.entity";
import { TleRecordEntity } from "../modules/tle/entities/tle-record.entity";

export const entities = [
    ApodEntity,
    NeoObjectEntity,
    NeoFeedDayEntity,
    DonkiEventEntity,
    EpicImageEntity,
    EonetEventEntity,
    MarsWeatherSolEntity,
    MediaAssetEntity,
    TechTransferItemEntity,
    TleRecordEntity,
    SsdCloseApproachEntity,
    SsdFireballEntity,
    SsdSentryObjectEntity,
    TechportProjectEntity,
    ExoplanetEntity,
];

export const typeOrmConfig: PostgresDataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities,
    migrations: ["dist/shared/infra/typeorm/migrations/*.js"],
};

export default new DataSource({
    ...typeOrmConfig,
    migrations: [join(__dirname, "../shared/infra/typeorm/migrations", __filename.endsWith(".ts") ? "*.ts" : "*.js")],
});
