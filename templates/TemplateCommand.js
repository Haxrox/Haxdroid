const Styles = require("../styles.json");
const Command = require('./Command.js');
const { MessageEmbed } = require('discord.js');

class COMMAND_NAME extends Command {
    async Execute(interaction) {

    }
}

const COMMAND_NAMECommand = new COMMAND_NAME("COMMAND_NAME", "DESCRIPTION");

module.exports = COMMAND_NAMECommand;