import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedModule } from "../shared/shared.module";
import { CommandsController } from "./controllers/commands.controller";
import { RanksController } from "./controllers/ranks.controller";
import { RightsController } from "./controllers/rights.controller";
import { Command } from "./entities/command.entity";
import { RankCommand } from "./entities/rank-command.entity";
import { RankRight } from "./entities/rank-right.entity";
import { Rank } from "./entities/rank.entity";
import { Right } from "./entities/right.entity";
import { CommandsRepository } from "./repositories/commands.repository";
import { RankCommandsRepository } from "./repositories/rank-commands.repository";
import { RankRightsRepository } from "./repositories/rank-rights.repository";
import { RanksRepository } from "./repositories/ranks.repository";
import { RightsRepository } from "./repositories/rights.repository";
import { CommandService } from "./services/command.service";
import { RankCommandService } from "./services/rank-command.service";
import { RankRightService } from "./services/rank-right.service";
import { RankService } from "./services/rank.service";
import { RightService } from "./services/right.service";

@Module({
    imports: [
        SharedModule,
        TypeOrmModule.forFeature([Rank, Command, Right, RankCommand, RankRight])
    ],
    controllers: [
        CommandsController,
        RanksController,
        RightsController
    ],
    providers: [
        CommandService,
        CommandsRepository,
        RankService,
        RanksRepository,
        RankCommandService,
        RankCommandsRepository,
        RankRightService,
        RankRightsRepository,
        RightService,
        RightsRepository
    ],
    exports: [
        CommandService,
        CommandsRepository,
        RankService,
        RanksRepository,
        RankCommandService,
        RankCommandsRepository,
        RankRightService,
        RankRightsRepository,
        RightService,
        RightsRepository
    ]
})
export class RankModule {}
