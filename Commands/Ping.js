const Command = require('./Command.js');

class Ping extends Command {
    async Execute(interaction) {
        super.Execute();
        await interaction.reply(`${interaction.client.ws.ping}ms`);
    }
}

module.exports = new Ping("ping", "Returns average ping of Haxdroid");