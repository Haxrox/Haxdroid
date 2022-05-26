const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const FileSystem = require('fs');
const Configuration = require('./config.json');

const DISPATCH_GUILD_COMMANDS = true;
const DISPATCH_COMMANDS = true;

const rest = new REST({ version: '9' }).setToken(Configuration.TESTING ? Configuration.TEST_TOKEN : Configuration.TOKEN);
const commands = [];

const applicationCommands = DISPATCH_GUILD_COMMANDS ? Routes.applicationGuildCommands(Configuration.TESTING ? Configuration.TEST_CLIENT_ID : Configuration.CLIENT_ID, Configuration.GUILD_ID) : Routes.applicationCommands(Configuration.TESTING ? Configuration.TEST_CLIENT_ID : Configuration.CLIENT_ID);

(async () => {
    if (DISPATCH_COMMANDS) {
        console.log("Dispatching %scommands ...", DISPATCH_GUILD_COMMANDS ? "guild " : "");

        const commandFiles = FileSystem.readdirSync('./commands').filter(file => (file != 'Command.js' && file != 'SlashCommand.js'));
        commandFiles.filter(command => true).forEach(file => {
            if (file.endsWith('.js')) {
                var command = require(`./commands/${file}`);
            } else {
                var commandFile = FileSystem.readdirSync(`./commands/${file}`).filter(subFile => subFile.endsWith('.js')).find(subFile => subFile.toUpperCase().startsWith(file.toUpperCase()));
                var command = require(`./commands/${file}/${commandFile}`);
            }
            const commandData = command.GetData()
                .setDefaultPermission(command.defaultPermission);
            commands.push(commandData.toJSON());
        });
    } else {
        console.log("Deleting %scommands ...", DISPATCH_GUILD_COMMANDS ? "guild " : "");
    }

    await rest.put(applicationCommands, {
        body: commands
    }).then((data) => {
        console.log("Registered %scommands [%d]:", DISPATCH_GUILD_COMMANDS ? "guild " : "", data.length);
        data.forEach(command => {
            console.log(`%s [${command.id}] [${command.default_permission}]: %s`, command.name, command.description);
        });
        return data;
    })
        .catch(console.error)
        .finally(() => {
            console.log("Dispatched %scommands complete", DISPATCH_GUILD_COMMANDS ? "guild " : "");
        });
})();