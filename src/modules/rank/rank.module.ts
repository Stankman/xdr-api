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
import { RankCommand } from './entities/rank-command.entity';
import { RankRight } from './entities/rank-right.entity';
import { RankCommandService } from './services/rank-command.service';
import { RankCommandsRepository } from './repositories/rank-commands.repository';
import { RankRightService } from './services/rank-right.service';
import { RankRightsRepository } from './repositories/rank-rights.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Rank, Command, Right, RankCommand, RankRight]),
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
        RightsRepository,
        RankCommandService,
        RankCommandsRepository,
        RankRightService,
        RankRightsRepository
    ],
    exports: [
        RankService,
        RanksRepository,
        CommandService,
        CommandsRepository,
        RightService,
        RightsRepository,
        RankCommandService,
        RankCommandsRepository,
        RankRightService,
        RankRightsRepository
    ]
})
export class RankModule {}
