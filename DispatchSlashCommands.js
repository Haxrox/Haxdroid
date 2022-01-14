const {REST} = require("@discordjs/rest");
const {Routes, PermissionFlagsBits} = require("discord-api-types/v9");
const FileSystem = require('fs');
const Configuration = require('./config.json');

const DISPATCH_GUILD_COMMANDS = true;
const DELETE_COMMANDS = false;
const DISPATCH_COMMANDS = true;

const rest = new REST({version: '9'}).setToken(Configuration.TESTING ? Configuration.TEST_TOKEN : Configuration.TOKEN);
const commands = [];

if (DISPATCH_COMMANDS) {
    FileSystem.readdirSync('./commands').filter(file => (file.endsWith('.js') && file != 'Command.js' && file != 'SlashCommand.js')).forEach(file => {
        const command = require(`./commands/${file}`);
        commands.push(command.GetData());
    });
}

var applicationCommands = DISPATCH_GUILD_COMMANDS ? Routes.applicationGuildCommands(Configuration.TESTING ? Configuration.TEST_CLIENT_ID : Configuration.CLIENT_ID, Configuration.GUILD_ID) : Routes.applicationCommands(Configuration.TESTING ? Configuration.TEST_CLIENT_ID : Configuration.CLIENT_ID);

console.log("Dispatching commands ...");
rest.put(applicationCommands, {
    body: DISPATCH_COMMANDS ? commands.map(command => command.toJSON()) : []
}).then((data) => {
    console.log("Registered %scommands [%d]:", DISPATCH_GUILD_COMMANDS ? "guild " : "", data.length);
    data.forEach(command => {
        console.log(`Registered %s [${command.id}]: %s`, command.name, command.description);
    });

    if (DELETE_COMMANDS) {
        const promises = [];
        data.filter(command => true).forEach(command => {
            console.log(`Deleting %s [${command.id}]: %s`, command.name, command.description);
            const deleteUrl = `${Routes.applicationGuildCommands(Configuration.TESTING ? Configuration.TEST_CLIENT_ID : Configuration.CLIENT_ID, Configuration.GUILD_ID)}/${command.id}`;
            promises.push(rest.delete(deleteUrl));
        });
        return Promise.all(promises);
    }
})
.catch(console.error)
.finally(() => {
    console.log("Dispatched %scommands complete", DISPATCH_GUILD_COMMANDS ? "guild " : "");
});



