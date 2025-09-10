import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResetPasswordDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.REQUIRED_RESET_TOKEN'),
  })
  @IsString({
    message: i18nValidationMessage('validation.INVALID_RESET_TOKEN'),
  })
  resetToken: string;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.REQUIRED_NEW_PASSWORD'),
  })
  @IsString({
    message: i18nValidationMessage('validation.INVALID_NEW_PASSWORD'),
  })
  @MinLength(8, {
    message: i18nValidationMessage('validation.PASSWORD_MIN_LENGTH'),
  })
  newPassword: string;
}
