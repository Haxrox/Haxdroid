const FileSystem = require("fs");

const Styles = require("../../styles.json");
const Command = require('../Command.js');
const {MessageEmbed, Collection} = require('discord.js');
const { bold, spoiler } = require("@discordjs/builders");

const ciphers = new Collection();

FileSystem.readdirSync('./commands/cryptography').filter(file => file !== 'Cryptography.js' && file !== 'Cipher.js').forEach(file => {
    const cipher = require(`./${file}`);
    ciphers.set(cipher.Name, cipher);
})

function addCiphers(option) {
    ciphers.forEach(cipher => {
        option.addChoice(cipher.Name, cipher.Name);
    });
}

class Cryptography extends Command {
    async Execute(interaction) {
        const cipher = interaction.options.getString("cipher", true);

        if (ciphers.has(cipher)) {
            const cipherClass = ciphers.get(cipher);
            const key = interaction.options.getString("key");
            let mode = interaction.options.getSubcommand();
            mode = mode === "encrypt" ? "Encrypt" : "Decrypt";

            if (key != undefined || !cipherClass[`${mode}Key`] ) {
                const data = cipherClass[mode](interaction.options.getString("message", true), key);

                const embed = new MessageEmbed()
                .setTitle(`${mode}ed Message`)
                .setDescription((key ? (bold("Key: ") + spoiler(data[0]) + "\n") : "") + bold("Message: ") + spoiler(data[1]))
                .setColor(Styles.Colours.Theme)
                .setTimestamp()            
                .setFooter({text: `${mode}ed by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
                interaction.reply({embeds: [embed], ephemeral: true});
            } else {
                this.Error(interaction, "Key required for this cipher");
            }
        } else {
            this.Error(interaction, `Invalid cipher - ${cipher}`);
        }
    }
}

const CryptographyCommand = new Cryptography("Cryptography", "Encrypt / decrypt messages with various encryption algorithms");
CryptographyCommand.GetData()
.addSubcommand(subcommand => 
    subcommand.setName("encrypt").setDescription("Encrypts the messsage")
    .addStringOption(option => {
        option.setName("cipher").setDescription("Cipher to encrypt the message").setRequired(true)
        addCiphers(option);
        return option;
    })
    .addStringOption(option => 
        option.setName("message").setDescription("Message to encrypt").setRequired(true)
    )
    .addStringOption(option => 
        option.setName("key").setDescription("Key to encrypt message (auto-generated if not specified)")
    )
)
.addSubcommand(subcommand => 
    subcommand.setName("decrypt").setDescription("Decrypts the message")
    .addStringOption(option => {
        option.setName("cipher").setDescription("Cipher to decrypt the message").setRequired(true)
        addCiphers(option);
        return option
    })
    .addStringOption(option => 
        option.setName("message").setDescription("Message to decrypt").setRequired(true)
    )
    .addStringOption(option => 
        option.setName("key").setDescription("Key to decrypt message (if key is not given, will attempt to brute-force)")
    )
)

module.exports = CryptographyCommand;