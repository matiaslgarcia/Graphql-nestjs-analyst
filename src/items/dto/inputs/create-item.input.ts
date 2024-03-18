import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateItemInput {

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  name: string

  @IsString()
  @IsOptional()
  @Field(() => String)
  quantityUnits?: string



}
