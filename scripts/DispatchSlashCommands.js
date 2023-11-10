const { REST, Routes } = require('discord.js');
const FileSystem = require('fs');
const Configuration = require('../config.json');
const yargs = require('yargs');

const argv = yargs.option('testing', {
    alias: 't',
    description: 'Dispatch for testing',
    type: 'boolean',
    default: false
}).option('guild_commands', {
    alias: 'g',
    description: 'Dispatch guild commands',
    type: 'boolean',
    default: false
}).option("dispatch_commands", {
    alias: 'd',
    description: 'Dispatch commands',
    type: 'boolean',
    default: false
}).argv;

const DISPATCH_GUILD_COMMANDS = argv.guild_commands;
const DISPATCH_COMMANDS = argv.dispatch_commands;
const TESTING = argv.testing;

const RELATIVE_COMMANDS_PATH = "../commands"
const COMMANDS_PATH = "./commands"

const rest = new REST()
    .setToken(TESTING ? Configuration.TEST_TOKEN : Configuration.TOKEN);
const commands = [];

const applicationCommands = DISPATCH_GUILD_COMMANDS ?
    Routes.applicationGuildCommands(TESTING ? Configuration.TEST_CLIENT_ID : Configuration.CLIENT_ID,
        Configuration.GUILD_ID
    ) : Routes.applicationCommands(TESTING ? Configuration.TEST_CLIENT_ID : Configuration.CLIENT_ID);

(async () => {
    if (DISPATCH_COMMANDS) {
        console.log("Dispatching %scommands ...", DISPATCH_GUILD_COMMANDS ? "guild " : "");

        const commandFiles = FileSystem.readdirSync(COMMANDS_PATH).filter(file => (file != 'Command.js' && file != 'SlashCommand.js'));
        commandFiles.filter(command => true).forEach(file => {
            if (file.endsWith('.js')) {
                var command = require(`${RELATIVE_COMMANDS_PATH}/${file}`);
            } else {
                var commandFile = FileSystem.readdirSync(`${COMMANDS_PATH}/${file}`).filter(subFile => subFile.endsWith('.js')).find(subFile => subFile.toUpperCase().startsWith(file.toUpperCase()));
                var command = require(`${RELATIVE_COMMANDS_PATH}/${file}/${commandFile}`);
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
            console.log(`%s [%s] [%s]: %s`, command.name, command.id, command.default_member_permissions, command.description);
        });
        return data;
    })
        .catch(console.error)
        .finally(() => {
            console.log("Dispatched %scommands complete", DISPATCH_GUILD_COMMANDS ? "guild " : "");
        });
})();