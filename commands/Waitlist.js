const Styles = require("../styles.json");
const Command = require('./Command.js');
const { MessageEmbed } = require('discord.js');
const { bold, inlineCode, hyperlink } = require('@discordjs/builders');
const Axios = require("axios");
const Cheerio = require("cheerio");

const cache = {};
const INTERVAL = 600000; // 10 minutes
const ALERT_INTERVAL = 1000;
const ALERT_COUNT = 10;
    
function getSeatInfo(url) {
    return Axios.get(url).then(response => {
        const htmlParser = Cheerio.load(response.data);
        const title = htmlParser('.content.expand > h4').text();

        var seatsRemaining = 0;
        var description = "";

        htmlParser(".'table > tbody > tr > td").each((index, element) => {
            if (index % 2 === 0) {
                seatsRemaining = htmlParser(element).text().includes("Total Seats Remaining:") ? htmlParser(element).next().text() : seatsRemaining;
                description += (bold(htmlParser(element).text()) + " " + htmlParser(element).next().text()) + "\n";
            }
        });

        return [title, description, seatsRemaining];
    });
}

function initAlert(user, title, url) {
    const id = setInterval(() => {
        getSeatInfo(url).then(([title, description, seatsRemaining]) => {
            const embed = new MessageEmbed()
                .setAuthor({ name: "UBC", url: "https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome", iconURL: Styles.Icons.UBC })
                .setTitle(`${title} Waitlist Alert`)
                .setURL(url)
                .setColor(Styles.Colours.UBC)
                .setTimestamp()
                .setDescription(description)
                .setFooter({ text: `ID: ${id}`, iconURL: Styles.Icons.UBC });
            if (seatsRemaining > 0) {
                var count = ALERT_COUNT;
                let alertID = setInterval(() => {
                    if (count < 0 || cache[id] === undefined) {
                        clearInterval(alertID);
                    }
                    user.send({ content: seatsRemaining > 0 ? user.toString() : null, embeds: [embed] });
                    count--;
                }, ALERT_INTERVAL);
            }
            user.send({ content: seatsRemaining > 0 ? user.toString() : null, embeds: [embed] });
            
            cache[id].timestamp = new Date();
        }).catch(error => {
            const embed = new MessageEmbed()
                .setAuthor({ name: "UBC", url: "https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome", iconURL: Styles.Icons.UBC })
                .setTitle("Waitlist Alert Failed")
                .setColor(Styles.Colours.Red)
                .setTimestamp()
                .setDescription(`Failed to retrieve seat information: ${error.message}`)
                .setFooter({ text: `ID: ${id}`, iconURL: Styles.Icons.UBC });
            
            user.send({ embeds: [embed] });
        });
    }, INTERVAL);
    
    cache[id] = {
        url: url,
        title: title,
        user: user,
        timestamp: Date.now()
    }
    return id;
}

class Waitlist extends Command {
    async Execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply();
        if (subcommand === "register") {
            const url = interaction.options.getString("url", true);
            getSeatInfo(url).then(([title, description, seatsRemaining]) => {
                console.log(title, description);
                const embed = new MessageEmbed()
                    .setAuthor({ name: "UBC", url: "https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome", iconURL: Styles.Icons.UBC })
                    .setTitle(`${title} Waitlist Alert Registered`)
                    .setURL(url)
                    .setColor(Styles.Colours.UBC)
                    .setTimestamp()
                
                embed.setDescription(description);
                
                const alertID = initAlert(interaction.user, title, url);
                embed.setFooter({ text: `Requested by: ${interaction.user.username} | ID: ${alertID}`, iconURL: interaction.user.avatarURL() });   

                interaction.editReply({ embeds: [embed] });
            }).catch(error => {
                this.DeferError(interaction, error);
            });
        } else if (subcommand === "list") {
            const embed = new MessageEmbed()
                .setAuthor({ name: "UBC", url: "https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome", iconURL: Styles.Icons.UBC })
                .setTitle("Waitlist Alerts")
                .setColor(Styles.Colours.UBC)
                .setTimestamp()
                .setFooter({ text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });   

            var description = "";
            for (const id in cache) {
                if (cache[id].user.id === interaction.user.id) {
                    description += `${inlineCode(id)} - ${bold(hyperlink(cache[id].title, cache[id].url))} - ${(Date.now() - cache[id].timestamp) / 60000}min\n`;
                }
            }

            if (description === "") {
                description = "No alerts registered";
            }

            embed.setDescription(description);
            interaction.editReply({ embeds: [embed] });
        } else if (subcommand === "unregister") {
            const id = interaction.options.getString("id", true);
            if (cache[id] && cache[id].user.id === interaction.user.id) {
                clearInterval(id);
                delete cache[id];
                const embed = new MessageEmbed()
                    .setAuthor({ name: "UBC", url: "https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome", iconURL: Styles.Icons.UBC })
                    .setTitle("Waitlist Alerts")
                    .setDescription(`Alert: ${inlineCode(id)} deregistered`)
                    .setColor(Styles.Colours.UBC)
                    .setTimestamp()
                    .setFooter({ text: `Deregistered by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
                
                interaction.editReply({ embeds: [embed] });
            } else {
                this.DeferError(interaction, "Invalid alert id or no permissions to deregister");
            }
        } else {
            this.DeferError(interaction, "Invalid subcommand");
        }
    }
}

const WaitlistCommand = new Waitlist("Waitlist", "Alerts you when a class waitlist opens up.");
WaitlistCommand.GetData()
    .addSubcommand(subcommand =>
        subcommand.setName("register").setDescription("Register alerts for a class")
        .addStringOption(option =>
            option.setName("url").setDescription("The class url you want to Waitlist for.").setRequired(true)
        )
    )   
    .addSubcommand(subcommand =>
        subcommand.setName("unregister").setDescription("Unregister alerts for a class")
        .addStringOption(option =>
            option.setName("id").setDescription("Id of the alert").setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName("list").setDescription("List all your alerts")
    );
    
module.exports = WaitlistCommand;

