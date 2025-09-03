// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotebooksModule } from './notebooks/notebooks.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'notebooks',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    NotebooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// docker run -d --name notebooks_database -e MYSQL_ROOT_PASSWORD=admin -e MYSQL_DATABASE=notebooks -p 3306:3306 -v notebooks_data:/var/lib/mysql mysql
