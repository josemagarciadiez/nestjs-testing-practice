import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { CreateNotebookDto } from 'src/notebooks/dto/create-notebook.dto';
import { Notebook } from 'src/notebooks/entities/notebook.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/notebooks', () => {
    const dto: CreateNotebookDto = {
      title: 'Notebook de prueba E2E',
      content: 'Testing is haaarrrdd',
    };

    it('(GET) should return empty array when no results', () => {
      return request(app.getHttpServer())
        .get('/notebooks')
        .expect(200)
        .expect([]);
    });

    it('(POST) should create a new record', () => {
      return request(app.getHttpServer())
        .post('/notebooks')
        .send(dto)
        .expect(201)
        .expect((res: { body: Notebook }) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(dto.title);
          expect(res.body.content).toBe(dto.content);
        });
    });

    it('(GET) should return and array with the persisted records', () => {
      return request(app.getHttpServer())
        .get('/notebooks')
        .expect(200)
        .expect((res: { body: Notebook[] }) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0]).toHaveProperty('content');
          expect(res.body[0].title).toBe(dto.title);
          expect(res.body[0].content).toBe(dto.content);
        });
    });
  });
});
