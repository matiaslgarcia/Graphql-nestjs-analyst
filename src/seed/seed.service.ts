import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from 'src/lists/lists.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { ListItemService } from 'src/list-item/list-item.service';

@Injectable()
export class SeedService {

    private isProd: boolean

    constructor(
        private readonly configService: ConfigService,

        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,

        private readonly itemsService: ItemsService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly userService: UsersService,

        @InjectRepository(List)
        private readonly listRepository: Repository<List>,

        private readonly listService: ListsService,

        @InjectRepository(ListItem)
        private readonly listItemRepository: Repository<ListItem>,

        private readonly listItemService: ListItemService

    ) {
        this.isProd = configService.get('STATE') === 'prod'
    }



    async executedSeed(): Promise<boolean> {

        if (this.isProd) {
            throw new UnauthorizedException('We cannot run SEED in prod')
        }
        //Limpiar database 
        await this.deleteDatabase()

        // Crear users
        const user = await this.loadUser()

        // Crear items
        await this.loadItems(user)


        // Crear lists
        const list = await this.loadLists(user)


        //Crear listItems
        const items = await this.itemsService.findAll(user, { limit: 15, offset: 0 }, {})
        await this.loadListItems(list, items)

        return true
    }


    async deleteDatabase() {
        await this.listItemRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute()

        await this.listRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute()

        await this.itemRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute()

        await this.userRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute()




    }

    async loadUser(): Promise<User> {
        const users = []

        for (const user of SEED_USERS) {
            users.push(await this.userService.createUser(user))
        }
        return users[0];
    }

    async loadItems(user: User): Promise<void> {
        const itemsPromise = []

        for (const item of SEED_ITEMS) {
            itemsPromise.push(this.itemsService.create(item, user))
        }

        await Promise.all(itemsPromise)

    }

    async loadLists(user: User): Promise<List> {
        const list = []
        for (const lists of SEED_LISTS) {
            list.push(this.itemsService.create(lists, user))
        }

        return list[0]
    }

    async loadListItems(list: List, items: Item[]): Promise<void> {

        for (const item of items) {
            this.listItemService.create({
                quantity: Math.round(Math.random() * 10),
                completed: Math.round(Math.random() * 1) === 0 ? false : true,
                listId: list.id,
                itemId: item.id
            })
        }
    }
}
