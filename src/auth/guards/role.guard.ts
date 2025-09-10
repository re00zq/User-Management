import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the custom @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get the user object from the request (attached by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Check if the user's roles include any of the required roles
    // The user object must contain a 'roles' property for this to work
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
