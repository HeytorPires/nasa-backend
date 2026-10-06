import { Global, Module } from "@nestjs/common";
import { HTTP_CLIENT_PROVIDER } from "src/shared/tokens";
import { AxiosHttpClient } from "./implementation/axios-http-client";

@Global()
@Module({
    providers: [
        {
            provide: HTTP_CLIENT_PROVIDER,
            useClass: AxiosHttpClient,
        },
    ],
    exports: [HTTP_CLIENT_PROVIDER],
})
export class HttpClientModule {}
