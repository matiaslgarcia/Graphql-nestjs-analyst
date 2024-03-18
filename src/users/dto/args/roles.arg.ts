import { ArgsType, Field } from "@nestjs/graphql";
import { IsArray } from "class-validator";
import { ValidRoles } from "src/auth/enums/valid-roles.enum";


@ArgsType()
export class ValidRolesArgs {


    @IsArray()
    @Field(
        () => [ValidRoles], { nullable: true }
    )
    roles: ValidRoles[] = [];
}