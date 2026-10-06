import { Module } from "@nestjs/common";
import { NEO_PROVIDER } from "src/shared/tokens";
import { NeoProvider } from "./implementation/neo-provider";

@Module({
    providers: [
        {
            provide: NEO_PROVIDER,
            useClass: NeoProvider,
        },
    ],
    exports: [NEO_PROVIDER],
})
export class NeoModule {}
