const amqp = require('amqplib');
const { connect, disconnect, getChannel } = require('./rabbitmq'); // Reusing connection and channel

async function sendToQueue(message) {
  await connect();

  const queueName = 'myQueue';
  const channel = getChannel();

  await channel.assertQueue(queueName, { durable: false });
  await channel.sendToQueue(queueName, Buffer.from(message));

  console.log('Message sent to queue:', message);
}

module.exports = { sendToQueue };