import { Injectable } from '@nestjs/common';
import { CustomResponseService } from 'nestjs-custom-response';
import { SignInDTO } from '../dtos/signin.dto';
import { UsersService } from 'src/modules/user/services/users.service';

@Injectable()
export class SignInService {
    constructor(
        private readonly userService : UsersService
    ) {}

    public async signIn(customResponse : CustomResponseService, signInDTO : SignInDTO): Promise<CustomResponseService> {
        return customResponse;
    }
}
