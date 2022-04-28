const Styles = require("../styles.json");
const Command = require('./Command.js');
const Audio = require("../services/Audio.js");
const {MessageEmbed, Message} = require('discord.js');
const {bold, hyperlink} = require('@discordjs/builders');

const GUILD_VOICE = 2;
const YOUTUBE_URL = "https://www.youtube.com/results";
const YOUTUBE_MUSIC_URL = "https://music.youtube.com/search";
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
			const url = interaction.options.getString("song", true);
			audio = new Audio(interaction.client, channel, interaction.options.getBoolean("autoplay"));
			const song = await audio.Play(url, interaction.user);

			if (song) {
				const embed = new MessageEmbed()
				.setAuthor({name: "YouTube", url: "https://www.youtube.com/", iconURL: Styles.Icons.YouTube})
				.setTitle(`${Styles.Emojis.Music}  Music Initialized`)
				.setDescription(`${bold("Channel:")} <#${channel.id}>\n${bold("Autoplay:")} ${audio?.AutoPlay}`)
				.setColor(Styles.Colours.YouTube)
				.setTimestamp()
				.setFooter({text: `Initialized by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
				interaction.reply({embeds: [embed, song.Embed()]});
			} else {
				this.Error(interaction, "Failed to parse YouTube URL - " + url);
			}
		},
		info: async function(interaction) {
			const embed = new MessageEmbed()
			.setAuthor({name: "YouTube", url: "https://www.youtube.com/", iconURL: Styles.Icons.YouTube})
			.setTitle(`${Styles.Emojis.Music}  Music Information`)
			.setDescription(`${bold("Current Song:")} ${hyperlink(audio?.CurrentSong?.Title || "None", audio?.CurrentSong?.Url || "https://www.youtube.com/")}\n${bold("Channel:")} <#${audio?.Channel?.id || "None"}>\n${bold("Autoplay:")} ${audio?.AutoPlay || "None"}`)
			.addField(`Queue [${audio?.Queue.Size || "0"}]:`, audio?.Queue.Reduce((song) => `${Styles.Emojis.Bullet} ${hyperlink(song.Title, song.Url)} - ${hyperlink(song.Artist?.name, song.Artist?.channel_url)}\n`, "") || "Empty", true)
			.setColor(Styles.Colours.YouTube)
			.setTimestamp()
			.setFooter({text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
			interaction.reply({embeds: [embed]});
		},
		set: async function(interaction) {
			const autoplay = interaction.options.getBoolean("autoplay");
			if (autoplay != undefined) {
				audio.AutoPlay = autoplay;
				const embed = new MessageEmbed()
				.setAuthor({name: "YouTube", url: "https://www.youtube.com/", iconURL: Styles.Icons.YouTube})
				.setTitle(`${Styles.Emojis.Music}  Setting changed`)
				.setDescription(`Autoplay set to ${bold(autoplay)}`)
				.setColor(Styles.Colours.YouTube)
				.setTimestamp()
				.setFooter({text: `Stopped by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
				interaction.reply({embeds: [embed]});
			} else {
				this.Error(interaction, "Invalid property");
			}
		},
		search: async function(interaction) {
			var url;
			switch (interaction.options.getString("provider", true)) {
				case "youtube":
					url = new URL(YOUTUBE_URL)
					url.searchParams.append("search_query", interaction.options.getString("query", true));
					break;
				case "youtube_music":
					url = new URL(YOUTUBE_MUSIC_URL)
					url.searchParams.append("q", interaction.options.getString("query", true));
				default:
					break;
			}
			const embed = new MessageEmbed()
				.setAuthor({name: "YouTube", url: "https://www.youtube.com/", iconURL: Styles.Icons.YouTube})
				.setTitle(`${Styles.Emojis.Music}  Search`)
				.setURL(url.href)
				.setDescription(url.href)
				.setColor(Styles.Colours.YouTube)
				.setTimestamp()
				.setFooter({text: `Searched by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			interaction.reply({embeds: [embed]});
		},
		enqueue: async function(interaction) {
			await interaction.deferReply();
			// var head = audio.Queue.Get();
			const url = interaction.options.getString("song", true);
			const song = await audio?.Enqueue(url, interaction.user);

			if (song) {
				const embed = song.Embed()
					.setTitle(`${Styles.Emojis.Play}  Queued Song: ${song.Title}`)
				interaction.editReply({embeds: [embed]});
			} else {
				this.Error(interaction, "Failed to parse YouTube URL - " + song);
			}
		},
		skip: async function(interaction) {
			audio?.Skip();
			const embed = new MessageEmbed()
			.setAuthor({name: "YouTube", url: "https://www.youtube.com/", iconURL: Styles.Icons.YouTube})
			.setTitle(`${Styles.Emojis.Stop}  Music Skipped`)
			.setColor(Styles.Colours.YouTube)
            .setTimestamp()
            .setFooter({text: `Skipped by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			interaction.reply({embeds: [embed]});
		},
		pause: async function(interaction) {
			audio?.Pause();
			const embed = audio?.CurrentSong?.Embed()
				.setTitle(`${Styles.Emojis.Pause}  Music Paused: ${audio?.CurrentSong?.Title}`)
            	.setFooter({text: `Paused by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			interaction.reply({embeds: [embed]});
		},
		resume: async function(interaction) {
			audio?.Resume();
			const embed = audio?.CurrentSong?.Embed()
			.setTitle(`${Styles.Emojis.Pause}  Music Resumed: ${audio?.CurrentSong?.Title}`)
			.setFooter({text: `Paused by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			interaction.reply({embeds: [embed]});
		},
		stop: async function(interaction) {
			audio?.Stop();
			const embed = new MessageEmbed()
			.setAuthor({name: "YouTube", url: "https://www.youtube.com/", iconURL: Styles.Icons.YouTube})
			.setTitle(`${Styles.Emojis.Stop}  Music Stopped`)
			.setColor(Styles.Colours.YouTube)
            .setTimestamp()
            .setFooter({text: `Stopped by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
			interaction.reply({embeds: [embed]});
		},
		play: async function(interaction) {
			const url = interaction.options.getString("song", true);
			const song = await audio?.Play(url, interaction.user);
			const embed = song.Embed()
			.setFooter({text: `Played by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
			interaction.reply({embeds: [embed]});
		}
	}
	constructor(name, description) {
		super(name, description);
		for (const [key, func] of Object.entries(this.Subcommands)) {
			this.Subcommands[key] = func.bind(this);
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
	.addBooleanOption(option => 
		option.setName("autoplay").setDescription("Whether to continue playing music once the queue is empty")
	)
)
.addSubcommand(subcommand => 
	subcommand.setName("info").setDescription("Gets information about current music state")
)
.addSubcommand(subcommand => 
	subcommand.setName("search").setDescription("Searches for a song")
	.addStringOption(option => 
		option.setName("provider").setDescription("where to search for the song").setRequired(true)
		.addChoice("YouTube", "youtube")
		.addChoice("YouTube Music", "youtube_music")
	)
	.addStringOption(option => 
		option.setName("query").setDescription("song to search for").setRequired(true)
	)
)
.addSubcommand(subcommand =>
	subcommand.setName("set").setDescription("Set music configurations")
	.addBooleanOption(option => 
		option.setName("autoplay").setDescription("toggles autoplay")
	)
)
.addSubcommand(subcommand => 
	subcommand.setName("enqueue").setDescription("Adds a song to the queue")
	.addStringOption(option => 
		option.setName("song").setDescription("song to queue").setRequired(true)
	)
)
.addSubcommand(subcommand => 
	subcommand.setName("skip").setDescription("skips the current song")
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