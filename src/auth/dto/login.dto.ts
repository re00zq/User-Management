import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.REQUIRED_IDENTIFIER'),
  })
  @IsString({ message: i18nValidationMessage('validation.INVALID_IDENTIFIER') })
  identifier: string; // Can be username or email

  @IsNotEmpty({
    message: i18nValidationMessage('validation.REQUIRED_PASSWORD'),
  })
  @IsString({ message: i18nValidationMessage('validation.INVALID_PASSWORD') })
  password: string;
}
