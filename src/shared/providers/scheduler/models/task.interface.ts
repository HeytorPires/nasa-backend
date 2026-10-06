export interface ITask {
    name: string;
    cron: string;
    execute: () => void | Promise<void>;
}

export type ScheduledTaskOptions = Omit<ITask, "execute">;
