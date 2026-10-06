import { Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import cron, { ScheduledTask } from "node-cron";
import { ISchedulerProvider } from "../models/scheduler-provider.interface";
import { ITask } from "../models/task.interface";

@Injectable()
export class CronProvider implements ISchedulerProvider, OnApplicationShutdown {
    private readonly logger = new Logger(CronProvider.name);

    private readonly tasks: ScheduledTask[] = [];

    scheduleTask(task: ITask): Promise<void> {
        const scheduled = cron.schedule(
            task.cron,
            async () => {
                try {
                    await task.execute();
                } catch (error) {
                    this.logger.error(`Falha ao executar a task "${task.name}".`, error);
                }
            },
            { name: task.name, timezone: "UTC", noOverlap: true },
        );

        this.tasks.push(scheduled);

        return Promise.resolve();
    }

    async onApplicationShutdown(): Promise<void> {
        for (const task of this.tasks) {
            await task.destroy();
        }

        this.tasks.length = 0;
    }
}
