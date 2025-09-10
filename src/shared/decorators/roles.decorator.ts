import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role';

export const ROLES_KEY = 'roles';
/**
 * Custom decorator to assign required roles to an endpoint.
 * @param roles - An array of roles that are permitted to access the endpoint.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
