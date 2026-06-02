import { Module } from "@nestjs/common";
import { NasaProvider } from "./implementation/nasa-provider";

@Module({
    providers: [
        {
            provide: "NasaProvider",
            useClass: NasaProvider,
        },
    ],
    exports: ["NasaProvider"],
})
export class NasaModule {}
