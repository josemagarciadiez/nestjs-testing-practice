import { Test, TestingModule } from '@nestjs/testing';
import { NotebooksService } from '../notebooks.service';
import { Notebook } from '../entities/notebook.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateNotebookDto } from '../dto/create-notebook.dto';

// Mock de notebooks
const mockNotebooks: Notebook[] = [
  {
    id: 1,
    title: 'Mock notebook 1',
    content: 'Mock notebook 1 content',
  },
  {
    id: 2,
    title: 'Mock notebook 2',
    content: 'Mock notebook 2 content',
  },
  {
    id: 3,
    title: 'Mock notebook 3',
    content: 'Mock notebook 3 content',
  },
];

// Mock del repositorio
const mockNotebookRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('NotebooksService', () => {
  let service: NotebooksService;

  // Declaracion de la dependencia del servicio
  let repository: Partial<Repository<Notebook>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotebooksService,
        {
          // Mockeo del repositorio a traves de getRepositoryToken
          provide: getRepositoryToken(Notebook),
          useValue: mockNotebookRepository,
        },
      ],
    }).compile();

    service = module.get<NotebooksService>(NotebooksService);

    // Asignar repositorio a la variable
    repository = module.get<Repository<Notebook>>(getRepositoryToken(Notebook));
  });

  // Limpiar los mocks entre test para no interferir
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  // Test del metodo "findAll"
  describe('find all notebooks', () => {
    // Happy path ✅ with results
    it('should return all notebooks', async () => {
      // Arrange
      mockNotebookRepository.find.mockResolvedValue(mockNotebooks);

      // Act
      const notebooks = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith();
      expect(notebooks).toEqual(mockNotebooks);
      expect(notebooks).toHaveLength(mockNotebooks.length);
    });

    // Happy path ✅ with no results
    it('should return empty array when no results', async () => {
      // Arrange
      mockNotebookRepository.find.mockResolvedValue([]);

      // Act
      const notebooks = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith();
      expect(notebooks).toEqual([]);
      expect(notebooks).toHaveLength(0);
    });

    // Error path ❌
    it('should handle repository errors', async () => {
      // Arrange
      const message = 'Database connection failed';

      mockNotebookRepository.find.mockRejectedValue(new Error(message));

      // Act and Assert
      await expect(service.findAll()).rejects.toThrow(message);

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith();
    });
  });

  // Test del metodo "create"
  describe('create a new notebook', () => {
    // Happy path ✅
    it('should create a notebook', async () => {
      // Arrange
      const dto: CreateNotebookDto = {
        title: 'Mock notebook 4',
        content: 'Mock notebook 4 content',
      };

      const createdNotebook = {
        ...dto,
        id: undefined, // Como lo devuelve el metodo create del repo
      };

      mockNotebookRepository.create.mockReturnValue(createdNotebook);

      const savedNotebook = {
        ...createdNotebook,
        id: 4,
      };

      mockNotebookRepository.save.mockResolvedValue(savedNotebook);

      // Act
      const notebook = await service.create(dto);

      // Assert
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(dto);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(createdNotebook);

      expect(notebook).toBeDefined();
      expect(notebook.id).toBeDefined();
      expect(notebook).toEqual(savedNotebook);
    });

    // Error path ❌
    it('should handle repository create errors', async () => {
      // Arrage
      const dto: CreateNotebookDto = {
        title: 'Mock notebook 5',
        content: 'Mock notebook 5 content',
      };

      const message = 'Entity creation failed';

      mockNotebookRepository.create.mockImplementation(() => {
        throw new Error(message);
      });

      // Act and Assert
      await expect(service.create(dto)).rejects.toThrow(message);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(dto);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should handle repository save errors', async () => {
      // Arrage
      const dto: CreateNotebookDto = {
        title: 'Mock notebook 6',
        content: 'Mock notebook 6 content',
      };

      const createdNotebook = {
        ...dto,
        id: undefined, // Como lo devuelve el metodo create del repo
      };

      mockNotebookRepository.create.mockReturnValue(createdNotebook);

      const message = 'Error while saving record';

      mockNotebookRepository.save.mockRejectedValue(new Error(message));

      // Act and Assert
      await expect(service.create(dto)).rejects.toThrow(message);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(dto);

      expect(repository.save).toHaveBeenCalledWith(createdNotebook);
    });
  });
});
