import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@ValidatorConstraint({ name: "maxDateRange", async: false })
class MaxDateRangeConstraint implements ValidatorConstraintInterface {
    validate(value: unknown, args: ValidationArguments): boolean {
        const [startProperty] = args.constraints as [string, number];
        const startValue = (args.object as Record<string, unknown>)[startProperty];

        if (typeof value !== "string" || typeof startValue !== "string") {
            return true;
        }

        const [, maxDays] = args.constraints as [string, number];
        const days = Math.ceil((new Date(value).getTime() - new Date(startValue).getTime()) / MS_PER_DAY) + 1;

        return days <= maxDays;
    }

    defaultMessage(args: ValidationArguments): string {
        const [startProperty, maxDays] = args.constraints as [string, number];
        return `O intervalo entre ${startProperty} e ${args.property} não pode exceder ${maxDays} dias`;
    }
}

export function MaxDateRange(startProperty: string, maxDays: number, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [startProperty, maxDays],
            validator: MaxDateRangeConstraint,
        });
    };
}
