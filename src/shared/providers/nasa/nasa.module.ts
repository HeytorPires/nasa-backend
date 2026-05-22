import { Module } from "@nestjs/common";
import { NasaProvider } from "./implementation/nasa-provider";

@Module({
    providers: [NasaProvider],
    exports: [NasaProvider],
})
export class NasaModule {}
