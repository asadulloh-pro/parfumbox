import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }
    const token = auth.slice(7);
    try {
      const payload = this.jwt.verify<JwtPayload>(token);
      if (payload.role === 'admin') {
        throw new UnauthorizedException();
      }
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
