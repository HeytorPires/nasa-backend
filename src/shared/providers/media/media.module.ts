import { Module } from "@nestjs/common";
import { MEDIA_PROVIDER } from "src/shared/tokens";
import { MediaProvider } from "./implementation/media-provider";

@Module({
    providers: [
        {
            provide: MEDIA_PROVIDER,
            useClass: MediaProvider,
        },
    ],
    exports: [MEDIA_PROVIDER],
})
export class MediaModule {}
