const { Client, GatewayIntentBits} = require('discord.js');
const ReadyEvent = require('./events/Ready.js');
const Configuration = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildVoiceStates
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
