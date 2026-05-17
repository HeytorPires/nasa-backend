import { IsOptional, IsPositive, Min } from "class-validator";

export class FindApodDto {
    @IsOptional()
    date?: string;
    @IsOptional()
    start_date?: string;
    @IsOptional()
    end_date?: string;
    @IsOptional()
    @IsPositive()
    @Min(1)
    count?: number;
}
