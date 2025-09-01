// notebooks.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NotebooksService } from './notebooks.service';
import { CreateNotebookDto } from './dto/create-notebook.dto';
import { Notebook } from './entities/notebook.entity';

@Controller('notebooks')
export class NotebooksController {
  constructor(private readonly notebooksService: NotebooksService) {}

  @Get()
  async findAll(): Promise<Notebook[]> {
    try {
      return await this.notebooksService.findAll();
    } catch {
      throw new HttpException(
        'Error retrieving notebooks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body() createNotebookDto: CreateNotebookDto,
  ): Promise<Notebook> {
    try {
      return await this.notebooksService.create(createNotebookDto);
    } catch {
      throw new HttpException(
        'Error creating notebook',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
