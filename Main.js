const Discord = require('discord.js');
const ReadyEvent = require('./events/Ready.js');
const Configuration = require('./config.json');

const client = new Discord.Client({
    shards: 'auto',
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_BANS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

const Ready = ReadyEvent(client);
client.once(Ready.eventName, Ready.Execute.bind(Ready));

var failCount = 0;

function login() {
    client.login(Configuration.TESTING ? Configuration.TEST_TOKEN : Configuration.TOKEN).then(() => {
        failCount = 0; 
    }).catch ((error) => {
        console.error(error);
        setTimeout(login, failCount * 5000);
    });
}
login();
