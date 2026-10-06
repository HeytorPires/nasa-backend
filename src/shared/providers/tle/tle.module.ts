import { Module } from "@nestjs/common";
import { TLE_PROVIDER } from "src/shared/tokens";
import { TleProvider } from "./implementation/tle-provider";

@Module({
    providers: [
        {
            provide: TLE_PROVIDER,
            useClass: TleProvider,
        },
    ],
    exports: [TLE_PROVIDER],
})
export class TleModule {}
