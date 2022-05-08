const Axios = require("axios");
const { MessageEmbed } = require('discord.js');
const { bold, hyperlink } = require('@discordjs/builders');

const Config = require("../config.json");
const Styles = require("../styles.json");
const Constants = require("../constants.js");
const Command = require('./Command.js');
const Audio = require("../services/Audio.js");

var audio;

class Music extends Command {
	Subcommands = {
		init: async function (interaction) {
			await interaction.deferReply();
			const channel = interaction.options.getChannel("channel", true);
			const url = interaction.options.getString("song", true);
			audio = new Audio(interaction, channel, interaction.options.getBoolean("autoplay"), interaction.options.getBoolean("repeat"));
			const song = await audio.Play(url, interaction.user);

			if (song) {
				interaction.editReply({ embeds: [audio.InitEmbed, song.Embed()] });
			} else {
				this.DeferError(interaction, "Failed to parse YouTube URL - " + url);
				audio.Stop();
				audio = null;
			}
		},
		info: async function (interaction) {
			const reduce = audio?.Queue.Reduce((song) => `${Styles.Emojis.Bullet} ${hyperlink(song.Title, song.Url)} - ${hyperlink(song.Artist?.name, song.Artist?.channel_url)}\n`, "", 1024);
			const embed = new MessageEmbed()
				.setAuthor({ name: "YouTube", url: "https://www.youtube.com/", iconURL: Styles.Icons.YouTube })
				.setTitle(`${Styles.Emojis.Music}  Music Information`)
				.setDescription(`${bold("Current Song:")} ${hyperlink(audio?.CurrentSong?.Title || "None", audio?.CurrentSong?.Url || "https://www.youtube.com/")}\n${bold("Channel:")} <#${audio?.Channel?.id || "None"}>\n${bold("Autoplay:")} ${audio?.AutoPlay || "None"}`)
				.addField(`Queue [${reduce[0]}/${audio?.Queue.Size || "0"}]:`, audio?.Queue.Size > 0 ? reduce[1] : "Empty", true)
				.setColor(Styles.Colours.YouTube)
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });

			interaction.reply({ embeds: [embed] });
		},
		set: async function (interaction) {
			const autoplay = interaction.options.getBoolean("autoplay");
			const repeat = interaction.options.getBoolean("repeat");
			if (autoplay != undefined) {
				const embed = audio?.UpdateSetting(interaction, "AutoPlay", autoplay);
				interaction.reply({ embeds: [embed] });
			} else if (repeat != undefined) {
				const embed = audio?.UpdateSetting(interaction, "Repeat", autoplay);
				interaction.reply({ embeds: [embed] });
			} else {
				this.Error(interaction, "Invalid property");
			}
		},
		search: async function (interaction) {
			await interaction.deferReply();
			const embed = new MessageEmbed()
				.setAuthor({ name: "YouTube", url: "https://www.youtube.com/", iconURL: Styles.Icons.YouTube })
				.setTitle(`${Styles.Emojis.Music}  Search Results`)
				.setColor(Styles.Colours.YouTube)
				.setTimestamp()
				.setFooter({ text: `Searched by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
			var url;

			switch (interaction.options.getString("provider", true)) {
				case "youtube":
					const searchUrl = new URL(Constants.YOUTUBE_SEARCH_URL)
					searchUrl.searchParams.append("key", Config.YOUTUBE_KEY);
					searchUrl.searchParams.append("part", "snippet");
					searchUrl.searchParams.append("maxResults", 10);
					searchUrl.searchParams.append("type", "video");
					searchUrl.searchParams.append("q", interaction.options.getString("query", true));

					url = new URL(Constants.YOUTUBE_SEARCH_REULTS_URL)
					url.searchParams.append("search_query", interaction.options.getString("query", true));

					var results = "";
					var processed = 0;

					const response = await Axios.get(searchUrl.href);

					if (response.status) {
						response.data?.items?.some(song => {
							const videoUrl = new URL(Constants.YOUTUBE_VIDEO_URL)
							videoUrl.searchParams.append("v", song.id?.videoId);
							const append = `${Styles.Emojis.Bullet} ${hyperlink(song.snippet?.title, videoUrl.href)} - ${song.snippet?.channelTitle}\n`;
							if (results.length + append.length <= 2000) {
								processed++;
								results += append;
							} else {
								append += ` ${response.length - processed} more`
							}
							return results.length > 2000;
						});
					}
					embed.setURL(url.href)
						.setDescription(response.status && results || "None");
					break;
				case "youtube_music":
					url = new URL(Constants.YOUTUBE_MUSIC_SEARCH_RESULT_URL)
					url.searchParams.append("q", interaction.options.getString("query", true));

					embed.setURL(url.href)
						.setDescription(url.href);
					break;
				default:
					break;
			}

			interaction.editReply({ embeds: [embed] });
		},
		enqueue: async function (interaction) {
			await interaction.deferReply();
			const url = interaction.options.getString("song", true);
			const song = await audio?.Enqueue(url, interaction.user);

			if (song) {
				const embed = song.Embed()
					.setTitle(`${Styles.Emojis.Play}  Queued Song: ${song.Title}`)
				interaction.editReply({ embeds: [embed] });
			} else {
				this.Error(interaction, "Failed to parse YouTube URL - " + song);
			}
		},
		skip: async function (interaction) {
			const embed = audio?.Skip(interaction);
			interaction.reply({ embeds: [embed] });
		},
		pause: async function (interaction) {
			const embed = audio?.Pause(interaction);
			interaction.reply({ embeds: [embed] });
		},
		resume: async function (interaction) {
			const embed = audio?.Resume(interaction);
			interaction.reply({ embeds: [embed] });
		},
		stop: async function (interaction) {
			const embed = audio?.Stop(interaction);
			interaction.reply({ embeds: [embed] });
		},
		play: async function (interaction) {
			await interaction.deferReply();
			const url = interaction.options.getString("song", true);
			const song = await audio?.Play(url, interaction.user);
			if (song) {
				const embed = song.Embed()
					.setFooter({ text: `Played by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
				interaction.editReply({ embeds: [embed] });
			} else {
				this.DeferError(interaction, "Failed to play song: " + url);
			}
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
			if (audio?.State !== audio?.STATES?.DEAD || subcommand === "init") {
				this.Subcommands[subcommand](interaction);
			} else {
				this.Error(interaction, "Music not initialized. Use the command **/music init `channel` `song` [autoplay] [repeat]** to initialize")
			}
		} else {
			this.Error(interaction, "Invalid subcommand - " + subcommand);
		}
	}

	async ExecuteButton(interaction) {
		switch (interaction.customId) {
			case audio?.ID.MUSIC_PAUSE:
				audio.State === audio?.STATES.PLAY ? audio.Pause(interaction) : audio.Resume(interaction);
				audio.Buttons.components[0] = audio.State === audio?.STATES.PLAY ? audio.PauseButton : audio.ResumeButton;
				break;
			case audio?.ID.MUSIC_SKIP:
				audio.Skip(interaction);
				break;
			case audio?.ID.MUSIC_AUTOPLAY:
				audio?.Buttons.components[2] = audio?.AutoPlay ? audio?.AutoPlayOnButton : audio?.AutoPlayOffButton
				audio?.UpdateSetting(interaction, "AutoPlay", !audio?.AutoPlay);
				break;
			case audio?.ID.MUSIC_REPEAT:
				audio?.Buttons.components[3] = audio?.Repeat ? audio?.RepeatOnButton : audio?.RepeatOffButton
				audio?.UpdateSetting(interaction, "Repeat", !audio?.Repeat);
				break;
			case audio?.ID.MUSIC_STOP:
				audio.Stop(interaction);
				break;
		}

		if (interaction.customId != audio?.ID.MUSIC_STOP) {
			audio?.UpdateQueue();
			interaction.update({ embeds: [audio?.InitEmbed, audio?.CurrentSong?.Embed(), audio?.QueueEmbed], components: [audio.Buttons] });
		}
	}
}

const MusicCommand = new Music("Music", "Music player");
MusicCommand.GetData()
	.addSubcommand(subcommand =>
		subcommand.setName("init").setDescription("Initializes the music player")
			.addChannelOption(option =>
				option.setName("channel").setDescription("Voice channel to join").setRequired(true).addChannelType(Constants.GUILD_VOICE)
			)
			.addStringOption(option =>
				option.setName("song").setDescription("Song to play").setRequired(true)
			)
			.addBooleanOption(option =>
				option.setName("autoplay").setDescription("Whether to continue playing music once the queue is empty")
			)
			.addBooleanOption(option =>
				option.setName("repeat").setDescription("Whether to repeat the currently playing song")
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
			.addBooleanOption(option =>
				option.setName("repeat").setDescription("Whether to repeat the currently playing song")
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