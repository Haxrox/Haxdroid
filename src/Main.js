const {Client, GatewayIntentBits} = require('discord.js');
const yargs = require('yargs');
const ready = require('./events/Ready.js');
const Configuration = require('./configs/config.json');

const argv = yargs.option('debug', {
  alias: 'd',
  description: 'Set debugging to true',
  type: 'boolean',
  default: false,
}).option('test', {
  alias: 't',
  description: 'Set testing to true',
  type: 'boolean',
  default: false,
}).argv;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const readyEvent = ready(client);
client.once(readyEvent.eventName, readyEvent.execute.bind(readyEvent));

let failCount = 0;

/**
 * Logs into the Bot
 */
function login() {
  client.login((argv.test || argv.debug) ? Configuration.TEST_TOKEN :
    Configuration.TOKEN,
  ).then(() => {
    if (argv.test) {
      process.exit(0);
    }
    failCount = 0;
  }).catch((error) => {
    if (argv.test) {
      process.exit(1);
    }
    console.error(error);
    setTimeout(login, failCount * 5000);
  });
}
login();
