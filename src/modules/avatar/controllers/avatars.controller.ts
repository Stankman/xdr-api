import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { Avatar } from "../entities/avatar.entity";
import { AvatarService } from "../services/avatar.service";
import { FindManyOptions } from "typeorm";
import { AppConfigService } from "src/config/app/app-config.service";

@ApiTags('Avatars')
@Controller('avatars')
export class AvatarsController {
    constructor(
        private readonly avatarService : AvatarService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Get('all')
    public async paginateAvatars(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Avatar, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        let searchOptions : FindManyOptions<Avatar> = {}

        return await this.avatarService.paginateAvatars(options, searchOptions);
    }

    @Get(':id')
    public async getAvatar(@Param() params : any) : Promise<Avatar> {
        return await this.avatarService.getAvatarById(params.id);
    }

    // @Put(':id')
    // public async updateAvatar() : Promise<Avatar> {
    //     return await this.avatarService.updateAvatar();
    // }
}