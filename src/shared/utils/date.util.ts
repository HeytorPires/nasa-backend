const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function toIsoDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

export function countDaysBetween(startDate: Date, endDate: Date): number {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
}

export function addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * MS_PER_DAY);
}
