import { Module } from "@nestjs/common";
import { EONET_PROVIDER } from "src/shared/tokens";
import { EonetProvider } from "./implementation/eonet-provider";

@Module({
    providers: [
        {
            provide: EONET_PROVIDER,
            useClass: EonetProvider,
        },
    ],
    exports: [EONET_PROVIDER],
})
export class EonetModule {}
