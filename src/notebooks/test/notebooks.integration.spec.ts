import { Test, TestingModule } from '@nestjs/testing';
import { NotebooksController } from '../notebooks.controller';
import { NotebooksService } from '../notebooks.service';
import { Repository } from 'typeorm';
import { Notebook } from '../entities/notebook.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CreateNotebookDto } from '../dto/create-notebook.dto';

describe('Notebook Module Integration', () => {
  let module: TestingModule;
  let controller: NotebooksController;
  let service: NotebooksService;
  let repository: Repository<Notebook>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: 'admin',
          database: 'notebooks',
          entities: [Notebook],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Notebook]),
      ],
      providers: [NotebooksService],
      controllers: [NotebooksController],
    }).compile();

    controller = module.get<NotebooksController>(NotebooksController);
    service = module.get<NotebooksService>(NotebooksService);
    repository = module.get<Repository<Notebook>>(getRepositoryToken(Notebook));
  });

  afterAll(async () => {
    // Limpiar la base de datos antes de cada test
    await repository.clear();
    // Cerrar y limpiar
    await module.close();
  });

  beforeEach(async () => {
    // Limpiar la base de datos antes de cada test
    await repository.clear();
  });

  // Database connection
  describe('database', () => {
    it('should be connected', () => {
      expect(repository).toBeDefined();
      expect(service).toBeDefined();
      expect(controller).toBeDefined();
    });

    it('should be empty initially', async () => {
      const notebooks = await repository.find();
      expect(notebooks).toEqual([]);
    });
  });

  // Service integration
  describe('service integration', () => {
    describe('find all', () => {
      it('should return empty array when no records exist', async () => {
        const notebooks = await service.findAll();
        expect(notebooks).toEqual([]);
        expect(notebooks).toHaveLength(0);
      });

      it('should return all records from database', async () => {
        // Arrange
        const notebook1 = repository.create({
          title: 'Notebook 1',
          content: 'Notebook 1 content',
        });

        const notebook2 = repository.create({
          title: 'Notebook 2',
          content: 'Notebook 2 content',
        });

        await repository.save([notebook1, notebook2]);

        // Act
        const notebooks = await service.findAll();

        // Assert
        expect(notebooks).toHaveLength(2);

        expect(notebooks[0]).toHaveProperty('id');
        expect(notebooks[0].title).toBe('Notebook 1');

        expect(notebooks[1]).toHaveProperty('id');
        expect(notebooks[1].title).toBe('Notebook 2');
      });
    });

    describe('create', () => {
      it('should create and save record to database', async () => {
        // Arrange
        const dto: CreateNotebookDto = {
          title: 'Notebook 3',
          content: 'Notebook 3 content',
        };

        // Act
        const notebook = await service.create(dto);

        // Assert
        expect(notebook).toBeDefined();

        expect(notebook.id).toBeDefined();
        expect(notebook.title).toBe(dto.title);
        expect(notebook.content).toBe(dto.content);

        // Verificar que se guardo realmente
        const savedNotebook = await repository.findOne({
          where: { id: notebook.id },
        });

        expect(savedNotebook).toBeDefined();
        expect(savedNotebook?.title).toBe(dto.title);
        expect(savedNotebook?.content).toBe(dto.content);
      });
    });
  });

  // Controller integration
  describe('controller integration', () => {
    describe('GET /notebooks', () => {
      it('should return all notebooks', async () => {
        // Arrange
        const createdNotebook = repository.create({
          title: 'Notebook 4',
          content: 'Notebook 4 content',
        });

        await repository.save(createdNotebook);

        // Act
        const notebook = await controller.findAll();

        // Assert
        expect(notebook).toHaveLength(1);
        expect(notebook[0].title).toBe('Notebook 4');
      });

      it('should return empty array if database is empty', async () => {
        const notebooks = await controller.findAll();
        expect(notebooks).toEqual([]);
      });
    });

    describe('POST /notebooks', () => {
      it('should create notebook', async () => {
        // Arrange
        const dto: CreateNotebookDto = {
          title: 'Notebook 5',
          content: 'Notebook 5 content',
        };

        // Act
        const notebook = await controller.create(dto);

        // Assert
        expect(notebook.id).toBeDefined();
        expect(notebook.title).toEqual(dto.title);
        expect(notebook.content).toEqual(dto.content);

        const notebooks = await repository.find();

        expect(notebooks).toHaveLength(1);
        expect(notebooks[0].title).toEqual(dto.title);
      });
    });
  });
});
