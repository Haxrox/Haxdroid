const Command = require('./Command.js');
const {MessageEmbed, MessageAttachment} = require('discord.js');
const {bold, blockQuote} = require('@discordjs/builders');
const WolframAlphaAPI = require('wolfram-alpha-api');
const Configuration = require('../config.json');

const wolframAPI = WolframAlphaAPI(Configuration.WOLFRAM_ID);
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
                const inputPod = response.pods.find(pod => pod.id === "Input");
                const solutionPod = response.pods.find(pod => pod.id.includes("Solution"));
                const resultPod = response.pods.find(pod => pod.id === "Result");
                const plotPod = response.pods.find(pod => pod.id.includes("Plot"));

                // console.log(response);

                var inputString = "";
                var resultString = "";
                var solutionString = "";

                if (inputPod) {
                    inputPod.subpods.forEach(data => {
                        inputString = inputString.concat(`${data.plaintext}\n`);
                    })
                }

                if (solutionPod) {
                    solutionPod.subpods.forEach(data => {
                        solutionString = solutionString.concat(`${data.plaintext}\n`);
                    })
                }

                if (resultPod) {
                    resultPod.subpods.forEach(data => {
                        resultString = resultString.concat(`${data.plaintext}\n`);
                    })
                }

                const embed = new MessageEmbed()
                .setAuthor({name: "WolframAlpha", url: "https://www.wolframalpha.com/", iconURL: "https://pbs.twimg.com/profile_images/1134537628123115521/RqPloDPr_400x400.png"})
                .setTitle("Wolfram Query")
                .setURL(url.href)
                .setDescription(`${bold("Query:")} ${inputString}`)
                .addField("Solutions", blockQuote(solutionString || "None"), true)
                .addField("Result", blockQuote(resultString || "None"), true)
                .setImage(plotPod ? plotPod.subpods[0].img.src : "")
                .setColor('#fd745c')
                .setTimestamp()
                .setFooter({text: `Queried by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
                
                interaction.editReply({embeds: [embed]});
            } else {
                this.DeferError(interaction, `Query failed. Visit this **[link](${url.href})** to fix your query`);
            }
        }).catch(error => {
            this.DeferError(interaction, `Query failed. Failed to communicate with **[WolframAPI](https://products.wolframalpha.com/api/)**`);
        });
    }
}

const WolframCommand = new Wolfram("Wolfram", "Get answers from WolframAlpha");
WolframCommand.GetData()
.addStringOption(option => 
    option.setName("query").setDescription("WolframAlpha Query").setRequired(true)
);

module.exports = WolframCommand;