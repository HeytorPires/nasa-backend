import { HttpStatus, INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { LoggerInterceptor } from "src/interceptor/logger.interceptor";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";

export function appConfig(app: INestApplication) {
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    );

    app.useGlobalInterceptors(new LoggerInterceptor());

    app.enableCors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true,
    });

    app.enableVersioning({
        type: VersioningType.URI,
    });

    const configSwagger = new DocumentBuilder()
        .setTitle("nasa-api")
        .setDescription("Api facilitadora para consumir os dados da NASA")
        .setVersion("0.1")
        // .addBearerAuth({
        //     type: "http",
        //     scheme: "bearer",
        //     bearerFormat: "JWT",
        //     description: "Enter JWT token",
        //     in: "header",
        // })
        .build();

    const theme = new SwaggerTheme();
    const document = SwaggerModule.createDocument(app, configSwagger);
    SwaggerModule.setup("api-docs", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: "none",
            tagsSorter: "alpha",
            operationsSorter: "alpha",
            displayRequestDuration: true,
            filter: true,
        },
        customSiteTitle: "Nasa API",
        customCss: theme.getBuffer(SwaggerThemeNameEnum.DRACULA),
    });
}
