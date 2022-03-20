const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");
const { punish } = require(path.resolve('./Functions/punish.js'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('unmutes a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user that shall be unmuted')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why this user shall be unmuted')
            .setRequired(true)
        ),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)){
            return interaction.reply({content: "Missing permissions", ephemeral: true})
        }
        let user = interaction.options.getUser('user')
        let reason = interaction.options.getString('reason')
        user = interaction.guild.members.cache.find(a => a.id === user.id)
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User unmuted')
            .addField('Reason', reason)
            .addField('unmuted by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        if(user.moderatable){
            await user.timeout(0)
            user = interaction.options.getUser('user')
            await punish(reason,user,interaction.member,"unmute",interaction)
        }else {
            return await interaction.reply({content: "Can't unmute this user", ephemeral:true})
        }
        await interaction.reply({embeds: [embed]})
        let channel = interaction.guild.channels.cache.find(a=> a.name.includes("logs"))
        if(!channel){return;}
        const logEmbed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Kicked')
            .addField('General Info', `User Kicked: ${user.toString()} \`${user.id}\`\n Reason:\`${reason}\``)
            .addField('Unmuted by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        return channel.send({embeds: [logEmbed]})
    },
};
