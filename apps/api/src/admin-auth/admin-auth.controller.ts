import { Body, Controller, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminAuthService } from "./admin-auth.service";
import { AdminAuthResponseDto } from "./dto/admin-auth-response.dto";
import { AdminLoginDto } from "./dto/admin-login.dto";

@ApiTags("admin-auth")
@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly adminAuth: AdminAuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Admin email/password login" })
  @ApiOkResponse({ type: AdminAuthResponseDto })
  async login(@Body() body: AdminLoginDto): Promise<AdminAuthResponseDto> {
    return this.adminAuth.login(body.email, body.password);
  }
}
