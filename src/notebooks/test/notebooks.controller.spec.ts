import { Test, TestingModule } from '@nestjs/testing';
import { NotebooksController } from '../notebooks.controller';
import { NotebooksService } from '../notebooks.service';
import { CreateNotebookDto } from '../dto/create-notebook.dto';
import { Notebook } from '../entities/notebook.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

// Mock de una notebook
const mockNotebook: Notebook = {
  id: 1,
  title: 'Mock notebook',
  content: 'Mock notebook content',
};

// Mock del servicio
const mockNotebookService = {
  findAll: jest.fn(),
  create: jest.fn(),
};

describe('NotebooksController', () => {
  let controller: NotebooksController;

  // Declaracion de la dependencia del servicio
  let service: Partial<NotebooksService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotebooksController],
      providers: [
        {
          provide: NotebooksService,
          useValue: mockNotebookService,
        },
      ],
    }).compile();

    controller = module.get<NotebooksController>(NotebooksController);

    // Asignar servicio a la variable
    service = module.get<NotebooksService>(NotebooksService);
  });

  // Limpiar los mocks entre test para no interferir
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test del enpoint "findAll"
  describe('find all notebooks', () => {
    // Happy path ✅ with results
    it('should return all notebooks', async () => {
      // Arrange
      mockNotebookService.findAll.mockResolvedValue([mockNotebook]);

      // Act
      const notebooks = await controller.findAll();

      // Assert

      // Testear la llamada al servicio
      expect(service.findAll).toHaveBeenCalledTimes(1);
      // Testear que tenga al menos un registro (por el mock)
      expect(notebooks.length).toBeGreaterThan(0);
      // Testear que sea un array
      expect(notebooks).toEqual([mockNotebook]);
    });

    // Happy path ✅ with no results
    it('should return empty array when no results', async () => {
      // Arrange
      mockNotebookService.findAll.mockResolvedValue([]);

      // Act
      const notebooks = await controller.findAll();

      // Assert
      // Testear la llamada al servicio
      expect(service.findAll).toHaveBeenCalledTimes(1);
      // Testear que tenga al menos un registro (por el mock)
      expect(notebooks.length).toBe(0);
      // Testear que sea un array
      expect(notebooks).toEqual([]);
    });

    // Error path ❌
    it('should throw HttpExepction when service fails to read', async () => {
      // Arrange
      mockNotebookService.findAll.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act and Assert
      await expect(controller.findAll()).rejects.toThrow(
        new HttpException(
          'Error retrieving notebooks',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  // Test del endpoint "create"
  describe('create a new notebook', () => {
    // Happy path ✅
    it('should create a notebook', async () => {
      // Arrange
      const dto: CreateNotebookDto = {
        title: 'Notebook numero 2',
        content: 'Contenido de prueba de notebook 2',
      };

      const expectedCreatedNotebook = {
        ...dto,
        id: Date.now(),
      };

      mockNotebookService.create.mockResolvedValue(expectedCreatedNotebook);

      // Act
      const notebook = await controller.create(dto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(notebook).toBeDefined();
      expect(notebook.id).toBeDefined();
      expect(notebook).toEqual(expectedCreatedNotebook);
    });

    // Error path ❌
    it('should throw HttpExepction when service fails to create', async () => {
      // Arrange
      const dto: CreateNotebookDto = {
        title: 'Notebook numero 3',
        content: 'Contenido de prueba de notebook 3',
      };

      mockNotebookService.create.mockRejectedValue(
        new Error('Some validation failed'),
      );

      // Act and Assert
      await expect(controller.create(dto)).rejects.toThrow(
        new HttpException('Error creating notebook', HttpStatus.BAD_REQUEST),
      );

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });
});
