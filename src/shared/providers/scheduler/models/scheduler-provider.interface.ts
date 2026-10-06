import { ITask } from "./task.interface";

export interface ISchedulerProvider {
    scheduleTask(task: ITask): Promise<void>;
}
