const { SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed, Permissions,} = require('discord.js');
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('changes the slowmode of a channel')
        .addStringOption(option => option.setName('time').setDescription('how much time the slow-mode must be').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('the channel').setRequired(false)),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)){
            return interaction.reply({content:"Missing Permissions", ephemeral: true})
        }
        const amount = interaction.options.getString('time')
        const channel = interaction.options.getChannel('channel')
        let target = channel
        if(!amount)
        if(!channel){
            target = interaction.channel
        }
        let time;
        if(amount){
            time = ms(amount)/1000
        }else{
            time = 0
        }
        try {
            await target.setRateLimitPerUser()
            const embed = new MessageEmbed()
                .setTitle('Slowmode Changed')
                .setDescription('Slowmode changed to: ' + ms(time))
            return interaction.reply({embeds: [embed], ephemeral:true})
        }catch (e){
            return interaction.reply({content:'An error occurred during the process\nThe max amount of time is 6 hours',ephemeral: true})
        }
    },
};
