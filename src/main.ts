import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { appConfig } from "./config/app.config";
import { ENV_VARIABLE, EnvConfigService } from "./env-config/env-config.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    appConfig(app);

    const envConfigService = app.get(EnvConfigService);

    await app.listen(envConfigService.get(ENV_VARIABLE.PORT));
}

void bootstrap();
