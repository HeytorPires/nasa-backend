import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "isAfterOrEqual", async: false })
class IsAfterOrEqualConstraint implements ValidatorConstraintInterface {
    validate(value: unknown, args: ValidationArguments): boolean {
        const [relatedProperty] = args.constraints as [string];
        const relatedValue = (args.object as Record<string, unknown>)[relatedProperty];

        if (typeof value !== "string" || typeof relatedValue !== "string") {
            return true;
        }

        return new Date(value).getTime() >= new Date(relatedValue).getTime();
    }

    defaultMessage(args: ValidationArguments): string {
        const [relatedProperty] = args.constraints as [string];
        return `${args.property} deve ser maior ou igual a ${relatedProperty}`;
    }
}

export function IsAfterOrEqual(relatedProperty: string, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [relatedProperty],
            validator: IsAfterOrEqualConstraint,
        });
    };
}
