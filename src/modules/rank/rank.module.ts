import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rank } from './entities/rank.entity';
import { RankService } from './services/rank.service';
import { RanksRepository } from './repositories/ranks.repository';
import { RanksController } from './controllers/ranks.controller';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { Command } from './entities/command.entity';
import { Right } from './entities/right.entity';
import { CommandService } from './services/command.service';
import { CommandsRepository } from './repositories/commands.repository';
import { RightService } from './services/right.service';
import { RightsRepository } from './repositories/rights.repository';
import { CommandsController } from './controllers/commands.controller';
import { RightsController } from './controllers/rights.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Rank, Command, Right]),
        AppConfigModule
    ],
    controllers: [
        RanksController,
        CommandsController,
        RightsController
    ],
    providers: [
        RankService,
        RanksRepository,
        CommandService,
        CommandsRepository,
        RightService,
        RightsRepository
    ],
    exports: [
        RankService,
        RanksRepository,
        CommandService,
        CommandsRepository,
        RightService,
        RightsRepository
    ]
})
export class RankModule {}
