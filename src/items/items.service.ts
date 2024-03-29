import { Injectable, NotFoundException } from '@nestjs/common';

import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Item } from './entities/item.entity';
import { User } from 'src/users/entities/user.entity';

import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { SearchArgs } from '../common/dto/args/search.args';


@Injectable()
export class ItemsService {


  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,  //esto es para utilizar typeorm
  ) {

  }
  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {


    const newItem = this.itemsRepository.create({ ...createItemInput, user })

    return await this.itemsRepository.save(newItem)

  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<Item[]> {

    const { limit, offset } = paginationArgs
    const { search } = searchArgs

    const queryBuilder = this.itemsRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id })


    if (search) {
      queryBuilder.andWhere('LOWER(name) like : name', { name: `%${search.toLowerCase()}%` })
    }


    return queryBuilder.getMany();

  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id,
      user: { id: user.id }
    })

    if (!item) throw new NotFoundException(`Item with id ${id} not found`)

    return item
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {

    await this.findOne(id, user)
    //? const item = await this.itemsRepository.preload({...updateItemInput, user})  --> sin utilizar lazy
    const item = await this.itemsRepository.preload(updateItemInput)  // -> con lazy

    if (!item) throw new NotFoundException(`Item with id ${id} not found`)

    return this.itemsRepository.save(item)

  }

  async remove(id: string, user: User): Promise<Item> {

    const item = await this.findOne(id, user)

    await this.itemsRepository.remove(item)

    return { ...item, id }

  }


  async itemCount(user: User): Promise<number> {
    return this.itemsRepository.count({
      where: {
        user: {
          id: user.id
        }
      }
    })
  }
}
