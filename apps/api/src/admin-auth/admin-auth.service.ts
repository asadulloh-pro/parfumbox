import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string; expiresIn: number }> {
    const admin = await this.prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const expiresIn = this.parseExpiresIn(this.config.get<string>("ADMIN_JWT_EXPIRES_IN") ?? "1d");
    const accessToken = await this.jwt.signAsync({
      sub: admin.id,
      typ: "admin",
    });

    return { accessToken, expiresIn };
  }

  private parseExpiresIn(value: string): number {
    const m = /^(\d+)([smhd])$/i.exec(value.trim());
    if (m) {
      const n = Number(m[1]);
      const u = m[2].toLowerCase();
      const mult = u === "s" ? 1 : u === "m" ? 60 : u === "h" ? 3600 : 86400;
      return n * mult;
    }
    const asNum = Number(value);
    if (!Number.isNaN(asNum) && asNum > 0) {
      return asNum;
    }
    return 86400;
  }
}
