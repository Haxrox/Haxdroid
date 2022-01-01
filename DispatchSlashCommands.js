const {SlashCommandBuilder} = require("@discordjs/builders");
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");
const FileSystem = require('fs');
const Configuration = require('./config.json');

const DISPATCH_GUILD_COMMANDS = false;
const DELETE_COMMANDS = false;
const DISPATCH_COMMANDS = true;

const rest = new REST({version: '9'}).setToken(Configuration.TOKEN);
const commands = [];

if (DISPATCH_COMMANDS) {
    FileSystem.readdirSync('./Commands').filter(file => (file.endsWith('.js') && file != 'Command.js' && file != 'SlashCommand.js')).forEach(file => {
        const command = require(`./Commands/${file}`);
        commands.push(command.GetData());
    });
} 
/*
else {
    commands.push(
        new SlashCommandBuilder().setName('ping').setDescription('Replies with the'),
        new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
        new SlashCommandBuilder().setName('user').setDescription('Replies with user info!')
    )
}
*/

if (DISPATCH_GUILD_COMMANDS) {
    rest.put(Routes.applicationGuildCommands(Configuration.CLIENT_ID, Configuration.GUILD_ID), {
        body: DISPATCH_COMMANDS ? commands.map(command => command.toJSON()) : []
    }).then((data) => {
        console.log("Registered guild commands [%d]:", data.length);
        data.forEach(command => {
            console.log(`Registered %s [${command.id}]: %s`, command.name, command.description);
        });
    
        if (DELETE_COMMANDS) {
            const promises = [];
            data.filter(command => true).forEach(command => {
                console.log(`Deleting %s [${command.id}]: %s`, command.name, command.description);
                const deleteUrl = `${Routes.applicationGuildCommands(Configuration.CLIENT_ID, Configuration.GUILD_ID)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            });
            return Promise.all(promises);
        }
    })
    .catch(console.error)
    .finally(() => {
        console.log("Dispatched guild commands");
    });
} else {
    rest.put(Routes.applicationCommands(Configuration.CLIENT_ID), {
        body: DISPATCH_COMMANDS ? commands.map(command => command.toJSON()) : []
    }).then((data) => {
        console.log("Registered commands [%d]:", data.length);
        data.forEach(command => {
            console.log(`Registered %s [${command.id}]: %s`, command.name, command.description);
        });

        if (DELETE_COMMANDS) {
            const promises = [];
            data.filter(command => true).forEach(command => {
                console.log(`Deleting %s [${command.id}]: %s`, command.name, command.description);
                const deleteUrl = `${Routes.applicationGuildCommands(Configuration.CLIENT_ID)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            });
            return Promise.all(promises);
        }
    })
    .catch(console.error)
    .finally(() => {
        console.log("Dispatched client commands");
    });
}



