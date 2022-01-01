const DiscordBuilders = require("@discordjs/builders");
const {SlashCommandBuilder} = DiscordBuilders;

module.exports = class Command {
    /**
     * Abstract class for commands executed by the user
     * @abstract
     * @param {String} name name of the command
     * @param {String} description description of the command
     */
    constructor(name, description) {
        this.commandName = name;
        this.description = description;
        this.data = new SlashCommandBuilder().setName(name).setDescription(description);
    }

    /**
     * Gets the SlashCommandBuilder used to create this command
     * @returns a SlashCommandBuilder for this command
     */
    GetData() {
        return this.data;
    }

    /**
     * Sets the permissions necessary to execute the command
     * @param {Array} permissions a permissions array
     */
    SetPermissions(permissions) {
        this.Permissions = permissions;
    }

    /**
     * Executes the given interaction / SlashCommand
     * @param {CommandInteraction} interaction 
     */
    Execute(interaction) {
        console.log(`${this.commandName} executed`);
    }
}