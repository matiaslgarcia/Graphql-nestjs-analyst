import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { ListItemService } from 'src/list-item/list-item.service';
import { ListItemModule } from 'src/list-item/list-item.module';

@Module({
  providers: [ListsResolver, ListsService],
  imports: [
    TypeOrmModule.forFeature([List]),
    ListItemModule
  ],
  exports: [
    ListsService, 
    TypeOrmModule, //exportar funciones de typeOrm para utilizar los del iten
    
  ]
})
export class ListsModule {}
