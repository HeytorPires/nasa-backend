import { SetMetadata } from "@nestjs/common";
import { ScheduledTaskOptions } from "../models/task.interface";

export const SCHEDULED_TASK_METADATA = "scheduler:scheduled-task";

export const ScheduledTask = (options: ScheduledTaskOptions): MethodDecorator =>
    SetMetadata(SCHEDULED_TASK_METADATA, options);
