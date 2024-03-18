import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType() // esto es para una mutacion en graphql
export class SignupInput {


  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsNotEmpty()
  fullName: string;

  @Field(() => String)
  @MinLength(6)
  password: string;
}
