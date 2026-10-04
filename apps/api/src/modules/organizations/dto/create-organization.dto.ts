import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required' })
  name: string;
}
