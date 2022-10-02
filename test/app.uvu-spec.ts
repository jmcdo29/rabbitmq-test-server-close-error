import { suite } from 'uvu';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { equal, is } from 'uvu/assert';
import { ClientsModule, ClientRMQ, Transport } from '@nestjs/microservices';
import { INestMicroservice } from '@nestjs/common';

const RMQTestSuite = suite<{
  app: INestMicroservice;
  client: ClientRMQ;
}>('RMQ E2E Suite');
RMQTestSuite.before(async (context) => {
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

  context.app = moduleFixture.createNestMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
    },
  });
  await context.app.listen();
  context.client = context.app.get('TEST_CLIENT');
});
RMQTestSuite('It Should get call the "hello" event', ({ client }) => {
  return new Promise((resolve, reject) => {
    const responses = [];
    client.send('hello', {}).subscribe({
      next: (data) => responses.push(data),
      error: reject,
      complete: () => {
        is(responses.length, 1);
        equal(responses, ['Hello World!']);
        resolve();
      },
    });
  });
});
RMQTestSuite.after(async ({ app, client }) => {
  client.close();
  await app.close();
});

RMQTestSuite.run();
