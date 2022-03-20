const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");
const { punish } = require(path.resolve('./Functions/punish.js'));



module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user that shall be banned')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why this user shall be banned')
            .setRequired(true)
        ),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)){
            return interaction.reply({content: "Missing permissions", ephemeral: true})
        }
        let user = interaction.options.getUser('user')
        let reason = interaction.options.getString('reason')
        user = interaction.guild.members.cache.find(a => a.id === user.id)
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Banned')
            .addField('Reason', reason)
            .addField('Banned by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        if(user.bannable){
            await user.ban(user,{reason: reason})
            user = interaction.options.getUser('user')
            await punish(reason,user,interaction.member,"ban",interaction)
        }else {
            return await interaction.reply({content: "Can't ban this user", ephemeral:true})
        }
        await interaction.reply({embeds: [embed]})
        let channel = interaction.guild.channels.cache.find(a=> a.name.includes("logs"))
        if(!channel){return;}
        const logEmbed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Banned')
            .addField('General Info', `User Banned: ${user.toString()} \`${user.id}\`\n Reason:\`${reason}\``)
            .addField('Banned by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        return channel.send({embeds: [logEmbed]})
    },
};
