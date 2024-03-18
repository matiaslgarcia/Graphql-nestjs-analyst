import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

@InputType() // esto es para una mutacion en graphql
export class LoginInput {


  @Field(() => String)
  @IsEmail()
  email: string;


  @Field(() => String)
  @MinLength(6)
  password: string;
}
