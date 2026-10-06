import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { appConfig } from "./config/app.config";
import { ENV_VARIABLE, EnvConfigService } from "./env-config/env-config.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    appConfig(app);

    const envConfigService = app.get(EnvConfigService);
    const port = envConfigService.get(ENV_VARIABLE.PORT);

    await app.listen(port);

    if (process.env.NODE_ENV !== "production") {
        Logger.log(`API docs: http://localhost:${port}/api-docs`, "Bootstrap");
    }
}

void bootstrap();
