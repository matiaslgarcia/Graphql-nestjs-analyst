import { Resolver, Query, Mutation, Args, ID, Parent, ResolveField } from '@nestjs/graphql';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { ListItemService } from 'src/list-item/list-item.service';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(
    private readonly listsService: ListsService,
    private readonly listItemService: ListItemService
    ) {}

  @Mutation(() => List, {name: 'createList'})
  async createList
  (
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser() user: User
    ): Promise<List> {
    return this.listsService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  async findAll(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ):  Promise<List[]> {
    return this.listsService.findAll(user, paginationArgs, searchArgs);
  }

  @Query(() => List, { name: 'list' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    ): Promise<List> {
    return this.listsService.findOne(id, user);
  }

  @Mutation(() => List)
  async updateList(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @CurrentUser() user: User,
    ): Promise<List> {
    return this.listsService.update(updateListInput.id, updateListInput, user);
  }

  @Mutation(() => List)
  async removeList(
    @Args('id',  { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    ): Promise<List> {
    return this.listsService.remove(id, user);
  }


  @ResolveField(() =>[ListItem], { name: 'items'})
  async getListItems(
    @Parent() list: List,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
  ): Promise<ListItem[]>{
    return this.listItemService.findAll(list, paginationArgs, searchArgs);
  }


  async countListItemsByList(
    @Parent() list: List,
  ): Promise<number>{
    return this.listItemService.countListItemByList(list)
  }
}
