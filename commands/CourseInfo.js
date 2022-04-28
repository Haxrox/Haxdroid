const Command = require('./Command.js');
const Styles = require("../styles.json");
const {MessageEmbed} = require('discord.js');
const {blockQuote} = require('@discordjs/builders');
const Axios = require('axios');
const Cheerio = require("cheerio");

const BASE_URL = `https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course`;

class CourseInfo extends Command {
    async Execute(interaction) {
        await interaction.deferReply();
        
        const department = interaction.options.getString("department", true);
        const course = interaction.options.getString("course", true);

        const queryUrl = new URL(BASE_URL);
        queryUrl.searchParams.append("dept", department);
        queryUrl.searchParams.append("course", course);

        Axios.get(queryUrl.href).then(async response => {
            const htmlParser = Cheerio.load(response.data);
            const title = htmlParser('.content.expand > h4').text();
            const paragraphElements = [];

            htmlParser('.content.expand > p').each((index, element) => {
                paragraphElements.push(htmlParser(element).text());
            });

            const credits = paragraphElements[1] ? paragraphElements[1].slice(8).trim() : 0; // paragraphElements[1].search("Credits:")
            const preReqs = paragraphElements[2] ? paragraphElements[2].slice(9).trim() : "None"; // paragraphElements[2].search("Pre-reqs:")
            const coReqs = paragraphElements[3] ? paragraphElements[3].slice(8).trim() : "None"; // paragraphElements[2].search("Pre-reqs:")

            const embed = new MessageEmbed()
                .setAuthor({name: "UBC", url: "https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-all-departments", iconURL: Styles.Icons.UBC})
                .setTitle(`${title} Information`)
                .setDescription(blockQuote(paragraphElements[0].trim()))
                .setURL(queryUrl.href)
                .addField("Credits", `${credits} Credits`)
                .addField("Pre-Requisites", `${preReqs}`)
                .addField("Co-Requisites", `${coReqs}`)
                .setColor(Styles.Colours.UBC)
                .setTimestamp()
                .setFooter({text: `Requested by: ${interaction.user.username} | Data from UBC SSC Course Schedule`, iconURL: interaction.user.avatarURL()});

            await interaction.editReply({embeds: [embed]})
        }).catch(async error => {
            console.log(error);
            await this.DeferError(interaction, `Failed to get course info. Please retry. If this command constantly fails, try to use this **[link](${queryUrl.href})** to manually find the course`);
        });
    }
}

CourseInfoCommand = new CourseInfo("CourseInfo", "Gets UBC course information");
CourseInfoCommand.GetData()
.addStringOption(option => 
    option.setName("department").setDescription("Department of the course").setRequired(true)
)
.addStringOption(option =>
    option.setName("course").setDescription("Course code").setRequired(true)
);

module.exports = CourseInfoCommand;