import { IsBoolean, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateUserStatusDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_ACTIVE_NOT_EMPTY'),
  })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_ACTIVE_BOOLEAN') })
  isActive: boolean;
}
