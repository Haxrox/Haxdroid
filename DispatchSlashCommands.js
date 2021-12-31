const DiscordBuilders = require("@discordjs/builders");
const Configuration = require('./config.json');
const RestLibrary = require("@discordjs/rest");
const DiscordAPiTypes = require("discord-api-types/v9");
const SlashCommandBuilder = DiscordBuilders.SlashCommandBuilder;

const Rest = new RestLibrary.REST({version: '9'}).setToken(Configuration.TOKEN);

const Commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!!'),
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
].map(command => command.toJSON());

Rest.put(DiscordAPiTypes.Routes.applicationCommands(Configuration.CLIENT_ID), {
    body: Commands
}).then((data) => {
    console.log("Registered application commands");

    /* Deleting slash commands
    const promises = [];
    for (const command of data) {
        const deleteUrl = `${DiscordAPiTypes.Routes.applicationCommands(Configuration.CLIENT_ID)}/${command.id}`;
        promises.push(Rest.delete(deleteUrl));
    }
    return Promise.all(promises);
    */
}).catch(console.error);



