import { Module } from "@nestjs/common";
import { TECHPORT_PROVIDER } from "src/shared/tokens";
import { TechportProvider } from "./implementation/techport-provider";

@Module({
    providers: [
        {
            provide: TECHPORT_PROVIDER,
            useClass: TechportProvider,
        },
    ],
    exports: [TECHPORT_PROVIDER],
})
export class TechportModule {}
