const amqp = require('amqplib');
const logger = require('winston');
const { connect, disconnect, getChannel } = require('./rabbitmq'); // Reusing connection and channel

async function consumeFromQueue() {
  await connect();

  const queueName = 'myQueue';
  const channel = getChannel();

  await channel.assertQueue(queueName, { durable: false });
  channel.consume(queueName, (msg) => {
    if (msg !== null) {
      console.log('Received:', msg.content.toString());
      // Process the message here (e.g., database operation)
      
      channel.ack(msg);
    }
  });

  console.log('Waiting for messages...');
}

module.exports = { consumeFromQueue };
