import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";


@ObjectType()  // esto es para una query en graphql
export class AuthResponse {


    @Field(() => String)
    token: string;


    @Field(() => User)
    user: User;
}