import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'

import { SignupInput } from './dto/inputs/signup.input';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from 'src/users/users.service';
import { LoginInput } from './dto/inputs/login.input';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {


  constructor(
    private readonly usersServices: UsersService,
    private readonly jwtService: JwtService,
  ) { }


  async signup(signupInput: SignupInput): Promise<AuthResponse> {

    const user = await this.usersServices.createUser(signupInput)

    const token = this.jwtService.sign({ id: user.id })

    return {
      token,
      user
    }
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {

    const user = await this.usersServices.findOneByEmail(loginInput.email)

    if (!bcrypt.compareSync(loginInput.password, user.password)) {
      throw new BadRequestException('Email / Password do not match')
    }

    const token = this.jwtService.sign({ id: user.id })

    return {
      token,
      user
    }
  }

  async validateUser(id: string): Promise<User> {

    const user = await this.usersServices.findOneById(id)

    if (!user.isActive)
      throw new UnauthorizedException(`User is inactive, talk with an admin`)

    delete user.password

    return user;
  }



  async revalidateToken(user: User): Promise<AuthResponse> {
    const token = this.jwtService.sign({ id: user.id })
    
    return {
      token,
      user
    }

  }


}
