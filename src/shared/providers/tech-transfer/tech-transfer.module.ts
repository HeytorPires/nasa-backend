import { Module } from "@nestjs/common";
import { TECH_TRANSFER_PROVIDER } from "src/shared/tokens";
import { TechTransferProvider } from "./implementation/tech-transfer-provider";

@Module({
    providers: [
        {
            provide: TECH_TRANSFER_PROVIDER,
            useClass: TechTransferProvider,
        },
    ],
    exports: [TECH_TRANSFER_PROVIDER],
})
export class TechTransferModule {}
