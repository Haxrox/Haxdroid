const Styles = require("../styles.json");
const Command = require('./Command.js');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { bold, blockQuote } = require('@discordjs/builders');
const WolframAlphaAPI = require('wolfram-alpha-api');
const Configuration = require('../config.json');

const wolframAPI = WolframAlphaAPI(Configuration.WOLFRAM_KEY);
const BASE_URL = `https://www.wolframalpha.com/input`;

class Wolfram extends Command {
    async Execute(interaction) {
        await interaction.deferReply();
        const query = interaction.options.getString("query", true);

        const url = new URL(BASE_URL);
        url.searchParams.append("i", query);

        wolframAPI.getFull({
            input: query
        }).then(response => {
            if (response.success && !response.error) {
                const plotPod = response.pods.find(pod => pod.id.includes("Plot"));
                var fieldCount = 0;

                const embed = new MessageEmbed()
                    .setAuthor({ name: "WolframAlpha", url: "https://www.wolframalpha.com/", iconURL: Styles.Icons.Wolfram })
                    .setTitle("Wolfram Query")
                    .setURL(url.href)
                    .setImage(plotPod ? plotPod.subpods[0].img.src : "")
                    .setColor(Styles.Colours.Wolfram)
                    .setTimestamp()
                    .setFooter({ text: `Queried by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });

                response.pods.forEach(pod => {
                    if (!pod.id.includes("Plot")) {
                        var data = "";
                        pod.subpods.forEach(podData => {
                            data = data.concat(`${podData.plaintext}\n`);
                        })
                        if (data != "" && data != "\n" && fieldCount < 25) {
                            embed.addField(pod.id, blockQuote(data), fieldCount != 0 && fieldCount % 3 != 0);
                            fieldCount++;
                        }
                    }
                })
                interaction.editReply({ embeds: [embed] });
            } else {
                this.DeferError(interaction, `Query failed. Visit this **[link](${url.href})** to fix your query`);
            }
        }).catch(error => {
            this.DeferError(interaction, `Query failed. Failed to communicate with **[WolframAPI](https://products.wolframalpha.com/api/)**\n\n**Error**\m ${blockQuote(error.message)}`);
        });
    }
}

const WolframCommand = new Wolfram("Wolfram", "Get answers from WolframAlpha");
WolframCommand.GetData()
    .addStringOption(option =>
        option.setName("query").setDescription("WolframAlpha Query").setRequired(true)
    );

module.exports = WolframCommand;