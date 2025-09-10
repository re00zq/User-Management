import {
  IsOptional,
  IsString,
  IsIn,
  IsBooleanString,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class QueryUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.PAGE_INTEGER') })
  @Min(1, { message: i18nValidationMessage('validation.PAGE_MIN') })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.LIMIT_INTEGER') })
  @Min(1, { message: i18nValidationMessage('validation.LIMIT_MIN') })
  @Max(100, { message: i18nValidationMessage('validation.LIMIT_MAX') })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.SEARCH_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.SEARCH_NOT_EMPTY') })
  search?: string;

  @IsOptional()
  @IsBooleanString({
    message: i18nValidationMessage('validation.IS_ACTIVE_BOOLEAN'),
  })
  isActive?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.SORT_STRING') })
  @IsIn(['createdAt_asc', 'createdAt_desc', 'username_asc', 'username_desc'], {
    message: i18nValidationMessage('validation.SORT_INVALID'),
  })
  sortBy?: string = 'createdAt_desc';
}
