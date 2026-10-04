import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty({ message: 'Workflow name is required' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
