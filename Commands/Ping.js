const Command = require('./Command.js');

class Ping extends Command {
    async Execute(interaction) {
        await interaction.reply(`${interaction.client.ws.ping}ms`);
    }
}

module.exports = new Ping("Ping", "Returns average ping of Haxdroid");