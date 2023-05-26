import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, Matches, IsOptional } from "class-validator";

export class NewAvatarDTO {
    @ApiProperty()
    @IsString()
    username : string;

    @ApiProperty()
    @IsString()
    look: string;

    @ApiProperty()
    @IsString()
    gender: string;
}