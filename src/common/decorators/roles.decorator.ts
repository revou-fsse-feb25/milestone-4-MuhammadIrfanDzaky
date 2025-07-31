import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type RoleType = 'ADMIN' | 'CUSTOMER';

export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);