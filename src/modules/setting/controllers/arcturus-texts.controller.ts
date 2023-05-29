import { Controller, DefaultValuePipe, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ArcturusTextService } from "../services/arcturus-text.service";
import { ArcturusText } from "../entities/arcturus-text.entity";

@ApiTags('Arcturus Text')
//TODO ADD GUARD
@Controller('arcturus/texts')
export class ArcturusTextsController {

    constructor(
        private readonly arcturusTextService : ArcturusTextService
    ) {}

    @Get()
    public async getSetting(
        @Query('key', new DefaultValuePipe('')) key : string
    ) : Promise<ArcturusText> {
        return this.arcturusTextService.getSettingByKey(key);
    }
}