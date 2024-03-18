import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ListItemService } from './list-item.service';
import { ListItem } from './entities/list-item.entity';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Resolver(() => ListItem)
@UseGuards(JwtAuthGuard)
export class ListItemResolver {

  constructor(private readonly listItemService: ListItemService) {}

  @Mutation(() => ListItem)
 async createListItem(
    @Args('createListItemInput') createListItemInput: CreateListItemInput,

    ): Promise<ListItem>
     {
    return this.listItemService.create(createListItemInput);
  }

  @Query(() => ListItem, { name: 'listItem' })
  async findOne(
    @Args('id', { type: () => String }) id: string
    ): Promise<ListItem> {
    return this.listItemService.findOne(id);
  }

  @Mutation(() => ListItem)
  async updateListItem(
    @Args('updateListItemInput') updateListItemInput: UpdateListItemInput
    
    ): Promise<ListItem> {
    return this.listItemService.update(updateListItemInput.id, updateListItemInput);
  }

}
