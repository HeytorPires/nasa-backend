import { SCHEDULER_PROVIDER } from "src/shared/tokens";
import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { CronProvider } from "./implementations/cron-provider";
import { SchedulerRunnerService } from "./scheduler-runner.service";

@Module({
    imports: [DiscoveryModule],
    providers: [
        {
            provide: SCHEDULER_PROVIDER,
            useClass: CronProvider,
        },
        SchedulerRunnerService,
    ],
    exports: [SCHEDULER_PROVIDER],
})
export class SchedulerModule {}
