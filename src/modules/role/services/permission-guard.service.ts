import { Injectable } from "@nestjs/common";
import { PermissionsRepository } from "../repositories/permissions.repository";
import { Permission } from "../entities/permission.entity";

@Injectable()
export class PermissionGuardService {
  constructor(
      private readonly repository : PermissionsRepository
  ) {}

  public async getPermissionByName(name: string) : Promise<Permission> {
    return this.repository.getPermission(name);
  }
}