import { Module } from "@nestjs/common";
import { EPIC_PROVIDER } from "src/shared/tokens";
import { EpicProvider } from "./implementation/epic-provider";

@Module({
    providers: [
        {
            provide: EPIC_PROVIDER,
            useClass: EpicProvider,
        },
    ],
    exports: [EPIC_PROVIDER],
})
export class EpicModule {}
