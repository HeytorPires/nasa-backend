import { Module } from "@nestjs/common";
import { SSD_PROVIDER } from "src/shared/tokens";
import { SsdProvider } from "./implementation/ssd-provider";

@Module({
    providers: [
        {
            provide: SSD_PROVIDER,
            useClass: SsdProvider,
        },
    ],
    exports: [SSD_PROVIDER],
})
export class SsdModule {}
