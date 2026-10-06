import { Module } from "@nestjs/common";
import { DONKI_PROVIDER } from "src/shared/tokens";
import { DonkiProvider } from "./implementation/donki-provider";

@Module({
    providers: [
        {
            provide: DONKI_PROVIDER,
            useClass: DonkiProvider,
        },
    ],
    exports: [DONKI_PROVIDER],
})
export class DonkiModule {}
