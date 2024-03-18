import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsInt, IsOptional, Min } from "class-validator";


@ArgsType()
export class PaginationArgs {


    @IsInt()
    @Min(0)
    @IsOptional()
    @Field(() => Int, { nullable: true })
    offset: number = 0;


    @IsInt()
    @Min(1)
    @IsOptional()
    @Field(() => Int, { nullable: true })
    limit: number = 10
}