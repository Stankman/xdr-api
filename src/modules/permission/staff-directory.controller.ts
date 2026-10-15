import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { StaffDirectoryResponseDto } from './staff-directory.dto';
import { StaffDirectoryService } from './staff-directory.service';

@ApiTags('Staff')
@Controller('staff')
export class StaffDirectoryController {
  constructor(private readonly staff: StaffDirectoryService) {}

  @Get()
  @ApiOkResponse({ type: StaffDirectoryResponseDto })
  list() {
    return this.staff.list();
  }
}
