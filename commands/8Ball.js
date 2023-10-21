const Styles = require("../styles.json");
const Command = require('./Command.js');
const {EmbedBuilder} = require('discord.js');
const wait = require('util').promisify(setTimeout);

const RESPONSES = [
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes definitely",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
    "Reply hazy, try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful"
]

const RESPONSE_DATA = {
    Red: {
        Emoji: Styles.Emojis.Red_Circle,
        Colour: Styles.Colours.Red
    },
    Yellow: {
        Emoji: Styles.Emojis.Yellow_Circle,
        Colour: Styles.Colours.Yellow
    },
    Green: {
        Emoji: Styles.Emojis.Green_Circle,
        Colour: Styles.Colours.Green
    }
}

class Magic8Ball extends Command {
    async Execute(interaction) {
        const responseIndex = Math.round(Math.random() * RESPONSES.length);
        await interaction.deferReply();
        await wait(1000);
        const responseColour = responseIndex < 10 ? "Green" : (responseIndex < 15 ? "Yellow" : "Red");
        const embed = new EmbedBuilder()
            // .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setTitle(`Magic :8ball:,  ${interaction.options.getString("question", true)}?`)
            .setDescription(`${RESPONSE_DATA[responseColour].Emoji}  ${RESPONSES[responseIndex]}.`)
            .setColor(RESPONSE_DATA[responseColour].Colour)
            .setTimestamp()
            .setFooter({text: `Asked by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
        await interaction.editReply({embeds: [embed]});
    }
}

const Magic8BallCommand = new Magic8Ball("8Ball", "Asks a Magic 8-Ball question")
Magic8BallCommand.GetData()
.addStringOption(option => 
    option.setName("question").setDescription("Enter your question").setRequired(true)
);

module.exports = Magic8BallCommand;