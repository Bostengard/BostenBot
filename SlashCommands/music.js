const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { RepeatMode } = require('discord-music-player')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('commands for music')
        .addSubcommand(subcommand => subcommand
            .setName("play")
            .setDescription("play a song")
            .addStringOption(option => option.setName('song-link').setDescription('The name of the song you would like to add').setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName('skip')
            .setDescription('skip the current song'))
        .addSubcommand(subcommand => subcommand
            .setName('stop')
            .setDescription('Stop playing music'))
        .addSubcommand(subcommand => subcommand
            .setName('loop')
            .setDescription('Toggle looping for the current song')),

    async execute(interaction,client) {
        let guildQueue = client.player.getQueue(interaction.guildId)
        await interaction.deferReply()

        if(!interaction.member.voice.channel){
            return interaction.editReply({content:"You're not on a voice channel"})
        }

        await interaction.user.fetch
        if(interaction.options.getSubcommand() === 'play'){
            const songname = interaction.options.getString('song-link')
            if(!songname.includes('https:')){return interaction.editReply(`That's not the link of a song`)}
            let queue = client.player.createQueue(interaction.guildId);
            await queue.join(interaction.member.voice.channel);
            try{
                let song = await queue.play(songname).catch(_ => {if(!guildQueue){queue.stop}})
            }catch {
                return interaction.editReply('Couldn\'t find that song')
            }

            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Song added!')
                .setFooter({text: `song added by ${interaction.user.tag}`,iconURL: interaction.user.avatarURL})
            return interaction.editReply({embeds: [embed]})
        }else if(interaction.options.getSubcommand() === 'skip'){
            guildQueue.skip()
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Song Skipped!')
                .setFooter({text: `song skipped by ${interaction.user.tag}`,iconURL: interaction.user.avatarURL})
            return interaction.editReply({embeds: [embed]})
        }else if(interaction.options.getSubcommand() === 'stop'){
            guildQueue.stop()
            const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Stopped Playing!')
                .setFooter({text: `Stopped by ${interaction.user.tag}`,iconURL: interaction.user.avatarURL})
            return interaction.editReply({embeds: [embed]})
        }else if(interaction.options.getSubcommand() === 'loop'){
            if(guildQueue.repeatMode === RepeatMode.DISABLED){
                guildQueue.setRepeatMode(RepeatMode.QUEUE)
                const embed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('Looping Song!')
                    .setFooter({text: `Done by ${interaction.user.tag}`,iconURL: interaction.user.avatarURL})
                return interaction.editReply({embeds: [embed]})
            }else{
                const embed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('Stoped Looping!')
                    .setFooter({text: `Done by ${interaction.user.tag}`,iconURL: interaction.user.avatarURL})
                guildQueue.setRepeatMode(RepeatMode.DISABLED)
                return interaction.editReply({embeds: [embed]})
            }
        }
    },
};
