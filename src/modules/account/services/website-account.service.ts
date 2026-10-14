import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';

@Injectable()
export class WebsiteAccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
  ) {}

  async findByEmail(email: string, includePassword = false): Promise<Account | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const query = this.accounts
      .createQueryBuilder('account')
      .where('account.email = :email', { email: normalizedEmail });
    if (includePassword) query.addSelect('account.password');
    return query.getOne();
  }

  async findById(id: number): Promise<Account | null> {
    return this.accounts.findOne({ where: { id } });
  }

  async create(email: string, passwordHash: string, ipAddress: string | null): Promise<Account> {
    const account = this.accounts.create({
      email: email.trim().toLowerCase(),
      password: passwordHash,
      emailVerified: false,
      emailVerifiedAt: null,
      lastLogin: null,
      ip_current: ipAddress,
      ip_register: ipAddress,
    });
    return this.accounts.save(account);
  }

  async updatePassword(accountId: number, passwordHash: string): Promise<void> {
    await this.accounts.update(accountId, { password: passwordHash });
  }

  async markEmailVerified(accountId: number, verifiedAt: Date): Promise<void> {
    await this.accounts.update(accountId, {
      emailVerified: true,
      emailVerifiedAt: verifiedAt,
    });
  }

  async updateLogin(accountId: number, ipAddress: string | null, at: Date): Promise<void> {
    await this.accounts.update(accountId, { lastLogin: at, ip_current: ipAddress });
  }
}
