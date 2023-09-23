const amqp = require('amqplib');

let connection = null;
let channel = null;

/**
 * Establishes a connection to an AMQP server and creates a channel for communication.
 * @returns {Promise<void>}
 */
async function connect() {
  try {
    if (!connection) {
      connection = await amqp.connect('amqp://localhost');
    }
    if (!channel) {
      channel = await connection.createChannel();
    }
  } catch (error) {
    console.error('Error connecting to AMQP server:', error);
  }
}

async function disconnect() {
  if (channel) {
    await channel.close();
    channel = null;
  }
  if (connection) {
    await connection.close();
    connection = null;
  }
}

function getChannel() {
  return channel;
}

module.exports = { connect, disconnect, getChannel };