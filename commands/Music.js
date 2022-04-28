const Styles = require("../styles.json");
const Command = require('./Command.js');
const Audio = require("../services/Audio.js");
const {MessageEmbed, Message} = require('discord.js');
const {bold} = require('@discordjs/builders');

const GUILD_VOICE = 2;
var audio;
// const stream = Ytdl('https://www.youtube.com/watch?v=F90Cw4l-8NY', {
// 	fmt: "mp3",
// 	highWaterMark: 1 << 62,
// 	liveBuffer: 1 << 62,
// 	dlChunkSize: 0, //disabling chunking is recommended in discord bot
// 	bitrate: 128
// });

class Music extends Command {
	Subcommands = {
		init: async function(interaction) {
			const channel = interaction.options.getChannel("channel", true);
			const song = interaction.options.getString("song", true);
			audio = !audio ? new Audio(channel) : audio;
			const status = audio.Play(song);

			if (status) {
				const embed = new MessageEmbed()
				.setTitle(`${Styles.Emojis.Music}  Music Initialized`)
				.setDescription(song)
				.setColor(Styles.Colours.Theme)
				.setTimestamp()
				.setFooter({text: `Initialized by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
				interaction.reply({embeds: [embed]});
			} else {
				this.Error(interaction, "Failed to parse YouTube URL - " + song);
			}
		},
		info: async function(interaction) {
			const embed = new MessageEmbed()
			.setTitle(`${Styles.Emojis.Music}  Music Information`)
			.setDescription(`${bold("Current Song:")} ${audio.CurrentSong}`)
			.addField("Channel:", audio.Channel, true)
			.addField("Queue Size:", audio.Queue.Size(), true)
			.setColor(Styles.Colours.Theme)
			.setTimestamp()
			.setFooter({text: `Queued by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
			interaction.reply({embeds: [embed]});
		},
		enqueue: async function(interaction) {
			// var head = audio.Queue.Get();
			const song = interaction.options.getString("song", true);
			const status = audio.Enqueue(song);

			if (status) {
				const embed = new MessageEmbed()
				.setTitle(`${Styles.Emojis.Music}  Song Queued [${audio.Queue.Size}/${audio.Queue.Size}]`)
				.setDescription(song)
				.setColor(Styles.Colours.Theme)
				.setTimestamp()
				.setFooter({text: `Queued by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
				
				interaction.reply({embeds: [embed]});
			} else {
				this.Error(interaction, "Failed to parse YouTube URL - " + song);
			}
		},
		pause: async function(interaction) {
			audio.Pause();
			const embed = new MessageEmbed()
			.setTitle(`${Styles.Emojis.Pause}  Music Paused`)
			.setColor(Styles.Colours.Theme)
            .setTimestamp()
            .setFooter({text: `Paused by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
			interaction.reply({embeds: [embed]});
		},
		resume: async function(interaction) {
			audio.Resume();
			const embed = new MessageEmbed()
			.setTitle(`${Styles.Emojis.Play}  Music Resumed`)
			.setColor(Styles.Colours.Theme)
            .setTimestamp()
            .setFooter({text: `Resumed by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
			interaction.reply({embeds: [embed]});
		},
		stop: async function(interaction) {
			audio.Stop();
			const embed = new MessageEmbed()
			.setTitle(`${Styles.Emojis.Stop}  Music Stopped`)
			.setColor(Styles.Colours.Theme)
            .setTimestamp()
            .setFooter({text: `Stopped by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
			interaction.reply({embeds: [embed]});
		},
		play: async function(interaction) {
			const song = interaction.options.getString("song", true);
			audio.Play(song);
			const embed = new MessageEmbed()
			.setTitle(`${Styles.Emojis.Play}  Playing Song`)
			.setDescription(song)
			.setColor(Styles.Colours.Theme)
            .setTimestamp()
            .setFooter({text: `Played by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
			interaction.reply({embeds: [embed]});
		}
	}
    async Execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

		if (this.Subcommands[subcommand]) {
			this.Subcommands[subcommand](interaction);
		} else {
			this.Error(interaction, "Invalid subcommand - " + subcommand);
		}
    }
}

const MusicCommand = new Music("Music", "Music player");
MusicCommand.GetData()
.addSubcommand(subcommand => 
    subcommand.setName("init").setDescription("Initializes the music player")
    .addChannelOption(option => 
        option.setName("channel").setDescription("Voice channel to join").setRequired(true).addChannelType(GUILD_VOICE)
    )
	.addStringOption(option => 
		option.setName("song").setDescription("Song to play").setRequired(true)
	)
)
.addSubcommand(subcommand => 
	subcommand.setName("info").setDescription("Gets information about current music state")
)
.addSubcommand(subcommand => 
	subcommand.setName("enqueue").setDescription("Adds a song to the queue")
	.addStringOption(option => 
		option.setName("song").setDescription("song to queue").setRequired(true)
	)
)
.addSubcommand(subcommand => 
	subcommand.setName("pause").setDescription("Pauses the music")
)
.addSubcommand(subcommand => 
	subcommand.setName("resume").setDescription("Resumes the music")
)
.addSubcommand(subcommand => 
	subcommand.setName("stop").setDescription("Stops the music and disconnects the bot")
)
.addSubcommand(subcommand => 
	subcommand.setName("play").setDescription("Stops currently playing song and plays new song")
	.addStringOption(option => 
		option.setName("song").setDescription("Song to play").setRequired(true)
	)
)


module.exports = MusicCommand;