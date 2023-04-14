import { Injectable } from '@nestjs/common';
import { AccountsRepository } from '../accounts.repository';
import { Account } from '../entities/account.entity';
import { ChangePasswordDTO } from '../dtos/change-password.dto';
import * as argon2 from 'argon2';
import { HashService } from 'src/modules/auth/services/hash.service';
import { InvalidPasswordException } from '../exceptions/invalid-password.exception';
import { SamePasswordException } from '../exceptions/same-password.exception';

@Injectable()
export class AccountSettingsService {
    constructor(
        private readonly repository : AccountsRepository,
        private readonly hashService : HashService
    ) {}

    public async changePassword(account : Account, changePasswordDTO : ChangePasswordDTO) : Promise<Account> {
        let currentPassword = (await this.repository.getAccount(account.id, 'id', true, { groups: ['account.privacy'] })).password;

        if(!(await argon2.verify(currentPassword, changePasswordDTO.oldPassword))) {
            throw new InvalidPasswordException();
        }

        if(await argon2.verify(currentPassword, changePasswordDTO.newPassword)) {
            throw new SamePasswordException();
        }

        account.password = await this.hashService.hash(changePasswordDTO.newPassword);

        return this.repository.transform(await this.repository.save(account));
    }
}
