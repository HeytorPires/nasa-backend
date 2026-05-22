import { PartialType } from "@nestjs/swagger";
import { CreateApodDto } from "./create-apod.dto";

export class UpdateApodDto extends PartialType(CreateApodDto) {}
