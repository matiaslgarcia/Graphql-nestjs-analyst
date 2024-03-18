import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'

import { User } from './entities/user.entity';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';


import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class UsersService {

  private logger = new Logger('UsersService')

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async createUser(signupInput: SignupInput): Promise<User> {

    try {

      const newUser = this.userRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10)
      })

      return await this.userRepository.save(newUser)

    } catch (error) {
      this.handlerDBErrors(error)
    }

  }
  async findAll(roles: ValidRoles[], paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<User[]> {
   
    const { limit, offset } = paginationArgs
    const { search } = searchArgs
    
    if (roles.length === 0) 
      return await this.userRepository.find({
        //TODO: no es necesario porque la relacion es lazy, si en el caso de eager
        // relations: {
        //   lastUpdateBy: true
        // }
    })

    return await this.userRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')  //el arg : es para permitir parametros a postgres
      .setParameter('roles', roles)
      .getMany()

  }

  async findOneById(id: string): Promise<User> {

    try {
      const user = await this.userRepository.findOneByOrFail({ id })

      return user


    } catch (error) {
      this.handlerDBErrors({
        code: 'error-001',
        detail: `${id} not found`
      })
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneByOrFail({ email })

      return user


    } catch (error) {
      this.handlerDBErrors({
        code: 'error-001',
        detail: `${email} not found`
      })
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    userUpdate: User
  ): Promise<User> {
    try {
      const userToUpdate = await this.userRepository.preload({
        ...updateUserInput,
        id
      })

      if (!userToUpdate) throw new NotFoundException(`User with id ${id} not found`)

      userToUpdate.lastUpdateBy = userUpdate
      return await this.userRepository.save(userToUpdate)
    } catch (error) {
      this.handlerDBErrors(error)
    }
  }


  async block(id: string, adminUser: User): Promise<User> {

    const userToBlock = await this.findOneById(id)

    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;

    return await this.userRepository.save(userToBlock);
  }

  private handlerDBErrors(error: any): never {
    try {
      if (error.code === '23505')
        throw new BadRequestException(error.detail.replace('Key ', ''))

      if (error.code === 'error-101')
        throw new BadRequestException(error.detail.replace('Key ', ''))


      this.logger.error(error)

      throw new InternalServerErrorException(`Please check server logs`)
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
