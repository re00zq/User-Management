import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Identifier should not be empty.' })
  @IsString()
  identifier: string; // Can be username or email

  @IsNotEmpty({ message: 'Password should not be empty.' })
  @IsString()
  password: string;
}
