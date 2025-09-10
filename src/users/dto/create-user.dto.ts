import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.REQUIRED_USERNAME'),
  })
  @IsString({ message: i18nValidationMessage('validation.INVALID_USERNAME') })
  username: string;

  @IsNotEmpty({ message: i18nValidationMessage('validation.REQUIRED_EMAIL') })
  @IsEmail({}, { message: i18nValidationMessage('validation.INVALID_EMAIL') })
  email: string;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.REQUIRED_PASSWORD'),
  })
  @IsString({ message: i18nValidationMessage('validation.INVALID_PASSWORD') })
  @MinLength(8, {
    message: i18nValidationMessage('validation.PASSWORD_MIN_LENGTH'),
  })
  password: string;
}
