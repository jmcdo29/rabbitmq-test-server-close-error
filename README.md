# RabbitMQ Unconfirmed Server Message

## Current Behavior

When running an e2e test and using a `ClientRMQ` isntance, generated with `ClientsModule.register`, occasionally a message will be left `unconfirmed` in the rabbit mq server instance, causing the following error:

```
~/node_modules/.pnpm/amqp-connection-manager@4.1.7_amqplib@0.10.3/node_modules/amqp-connection-manager/dist/cjs/ChannelWrapper.js:365
                    message.reject(new Error('Channel closed'));
                                   ^

Error: Channel closed
    at ~/node_modules/.pnpm/amqp-connection-manager@4.1.7_amqplib@0.10.3/node_modules/amqp-connection-manager/dist/cjs/ChannelWrapper.js:365:36
    at Array.forEach (<anonymous>)
    at ~/node_modules/.pnpm/amqp-connection-manager@4.1.7_amqplib@0.10.3/node_modules/amqp-connection-manager/dist/cjs/ChannelWrapper.js:361:43
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
```

Note: this does not happen every time, sometimes I can run the test 10 times and see no error. Other times its immediate.

## Expected Behavior

Upon closing the server, there should be no unconfirmed messages so that there's no error.

I _think_ this is happening in a test scenario because things are closing too quickly. I've tried this with both `jest` and `uvu` and have confirmed it does reproduce in both situations.

## Reproduction steps

1) clone this repo
2) install dependencies
3) run the `test:e2e:jest:fail` and `test:e2e:uvu:fail` npm scripts and see that eventually there is an error
  a) These scripts are written specifically as while loops to wait for the failure so you don't have to keep running them

