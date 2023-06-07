import { Body, Controller, Post } from '@nestjs/common';
import { RconService } from '../services/rcon.service';
import { RconDTO } from '../dtos/rcon.dto';

@Controller('rcon')
export class RconController {
    constructor(
        private readonly rconSerivce : RconService
    ) {}
}
