const Discord = require('discord.js');
const FileSystem = require('fs');
const Configuration = require('./config.json');

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_BANS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING
    ]
});

FileSystem.readdirSync('./Events').filter(file => (file.endsWith('.js') && file != "ClientEvent.js")).forEach(file => {
    const event = require(`./Events/${file}`);
    console.log("Read: - " + file + " | event: " + event.eventName);
	if (event.once) {
		client.once(event.eventName, (...args) => event.Execute(client, ...args));
	} else {
		client.on(event.eventName, (...args) => event.Execute(client, ...args));
	}
});

client.login(Configuration.TOKEN);
console.log("Client login");

/*
Client.once("ready", client => {
    console.log("Client ready");

    Client.on("messageCreate", message => {
        console.log("Message: " + message.content);
    })
    
    Client.on("interactionCreate", async interaction => {
        if (!interaction.isCommand()) {
            console.log("Not an interaction - " + interaction.type);
            return;
        }
    
        const command = interaction.commandName;
    
        console.log("Interaction - " + command);
        if (command === "ping") {
            await interaction.reply("Pong!");
        }
    
    })
})
*/
