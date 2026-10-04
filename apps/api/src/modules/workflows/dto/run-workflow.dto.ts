import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RunWorkflowDto {
  @IsString()
  @IsNotEmpty({ message: 'Inquiry or input text is required' })
  inquiryText: string;

  @IsString()
  @IsOptional()
  customerEmail?: string;
}
