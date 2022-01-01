const DiscordBuilders = require("@discordjs/builders");
const {SlashCommandBuilder} = DiscordBuilders;

module.exports = class Command {
    constructor(name, description) {
        this.commandName = name;
        this.description = description;
        this.data = new SlashCommandBuilder().setName(name).setDescription(description);
    }

    GetData() {
        return this.data;
    }

    SetPermissions(permissions) {
        this.Permissions = permissions;
    }

    Execute(interaction) {
        console.log(`${this.commandName} executed`);
    }
}