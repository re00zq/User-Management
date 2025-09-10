import { IsEmail, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.USERNAME_STRING') })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.EMAIL_VALID') })
  email?: string;
}
