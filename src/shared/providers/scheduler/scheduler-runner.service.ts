import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";

import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";

import { SCHEDULER_PROVIDER } from "src/shared/tokens";
import { SCHEDULED_TASK_METADATA } from "./decorators/scheduled-task.decorator";
import { ISchedulerProvider } from "./models/scheduler-provider.interface";
import { ScheduledTaskOptions } from "./models/task.interface";

type TaskMethod = () => void | Promise<void>;

@Injectable()
export class SchedulerRunnerService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SchedulerRunnerService.name);

    constructor(
        private readonly discovery: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector,

        @Inject(SCHEDULER_PROVIDER)
        private readonly scheduler: ISchedulerProvider,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        for (const wrapper of this.discovery.getProviders()) {
            await this.registerProviderTasks(wrapper.instance);
        }
    }

    private async registerProviderTasks(instance: unknown): Promise<void> {
        if (!instance || typeof instance !== "object") {
            return;
        }

        const prototype = Object.getPrototypeOf(instance);

        for (const methodName of this.metadataScanner.getAllMethodNames(prototype)) {
            await this.registerTask(instance, methodName);
        }
    }

    private async registerTask(instance: object, methodName: string): Promise<void> {
        const method = (instance as Record<string, unknown>)[methodName] as TaskMethod;

        const options = this.reflector.get<ScheduledTaskOptions>(SCHEDULED_TASK_METADATA, method);

        if (!options) {
            return;
        }

        await this.scheduler.scheduleTask({
            ...options,
            execute: method.bind(instance),
        });

        this.logger.log(`Task "${options.name}" agendada com o cron "${options.cron}".`);
    }
}
