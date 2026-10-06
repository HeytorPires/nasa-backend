import { TableColumnOptions } from "typeorm";

export function baseColumns(): TableColumnOptions[] {
    return [
        {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
        },
        {
            name: "created_at",
            type: "timestamp",
            default: "now()",
        },
        {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
        },
    ];
}
