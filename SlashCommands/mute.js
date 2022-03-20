const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");
const { punish } = require(path.resolve('./Functions/punish.js'));
const ms = require('ms')



module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user that shall be muted')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why this user shall be muted')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('duration')
            .setDescription('Min(1min)-Max(28d)')
            .setRequired(true)),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)){
            return interaction.reply({content: "Missing permissions", ephemeral: true})
        }
        let user = interaction.options.getUser('user')
        let reason = interaction.options.getString('reason')
        let duration = interaction.options.getString('duration')
        user = interaction.guild.members.cache.find(a => a.id === user.id)
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Muted')
            .addField('Reason', reason)
            .addField('Muted by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        if(user.moderatable){
            try{await user.timeout(ms(duration))}
            catch{return await interaction.reply({content: "Invalid time format", ephemeral:true})}
            user = interaction.options.getUser('user')
            await punish(reason,user,interaction.member,"mute",interaction)
        }else {
            return await interaction.reply({content: "Can't mute this user", ephemeral:true})
        }
        await interaction.reply({embeds: [embed]})
        let channel = interaction.guild.channels.cache.find(a=> a.name.includes("logs"))
        if(!channel){return;}
        const logEmbed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Muted')
            .addField('General Info', `User Muted: ${user.toString()} \`${user.id}\`\n Reason:\`${reason}\`\n Duration: \`${duration}\``)
            .addField('Muted by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        return channel.send({embeds: [logEmbed]})
    },
};
