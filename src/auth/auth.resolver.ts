import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { SignupInput, LoginInput } from './dto/inputs/';
import { AuthResponse } from './types/auth-response.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';

@Resolver(() => AuthResponse)
export class AuthResolver {

  constructor(
    private readonly authService: AuthService
  ) { }

  @Mutation(() => AuthResponse, { name: 'signup' })
  async signup(
    @Args('signupInput') signupInput: SignupInput
  ): Promise<AuthResponse> {
    return this.authService.signup(signupInput);
  }

  @Mutation(() => AuthResponse, { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginInput
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }


  @Query(() => AuthResponse, { name: 'revalidate' })
  @UseGuards(JwtAuthGuard)
  revalidateToken(
    @CurrentUser([ValidRoles.admin]) user: User
  ): Promise<AuthResponse> {
    return this.authService.revalidateToken(user);
  }

}
