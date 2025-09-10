import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Authentication') // Groups all endpoints under "Authentication" in the Swagger UI
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({
    status: 409,
    description: 'Username or email already in use.',
  })
  async register(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    registerUserDto: RegisterUserDto,
  ) {
    const user = await this.authService.register(registerUserDto);
    return {
      message: 'User registered successfully.',
      user,
    };
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user to get a JWT token' })
  @ApiBody({ type: LoginDto }) // Explicitly define the body for Swagger documentation
  @ApiResponse({ status: 200, description: 'Returns a JWT access token.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, invalid credentials.',
  })
  async login(@Request() req) {
    // Passport's LocalStrategy validates the user and attaches it to req.user
    return this.authService.login(req.user);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate password recovery process' })
  @ApiResponse({
    status: 200,
    description: 'Instructions for password reset have been processed.',
  })
  async forgotPassword(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete the password reset process' })
  @ApiResponse({
    status: 200,
    description: 'Password has been reset successfully.',
  })
  @ApiResponse({ status: 422, description: 'Invalid or expired reset token.' })
  async resetPassword(
    @Body(new ValidationPipe()) resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.resetToken,
      resetPasswordDto.newPassword,
    );
  }

  // This is an example of a protected route.
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth() // This decorator tells Swagger that this endpoint requires a bearer token.
  @ApiOperation({
    summary: 'Get the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: "Returns the authenticated user's profile data.",
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Request() req) {
    // The user object is attached to the request by the JwtStrategy from the token payload
    return req.user;
  }
}
