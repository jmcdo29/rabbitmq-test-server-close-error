import { Test, TestingModule } from '@nestjs/testing';
import { ClientRMQ, ClientsModule, Transport } from '@nestjs/microservices';
import { INestMicroservice } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientRMQ;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            transport: Transport.RMQ,
            name: 'TEST_CLIENT',
            options: {
              urls: ['amqp://localhost:5672'],
            },
          },
        ]),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
      },
    });
    await app.listen();
    client = app.get('TEST_CLIENT');
  });

  it('/ (GET)', (done) => {
    const responses = [];
    client.send('hello', {}).subscribe({
      next: (data) => responses.push(data),
      complete: () => {
        expect(responses.length).toBe(1);
        expect(responses).toEqual(['Hello World!']);
        done();
      },
    });
  });

  afterAll(async () => {
    client.close();
    await app.close();
  });
});
