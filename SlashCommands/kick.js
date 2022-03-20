const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");
const { punish } = require(path.resolve('./Functions/punish.js'));



module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user that shall be warned')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why this user shall be warned')
            .setRequired(true)
        ),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)){
            return interaction.reply({content: "Missing permissions", ephemeral: true})
        }
        let user = interaction.options.getUser('user')
        let reason = interaction.options.getString('reason')
        user = interaction.guild.members.cache.find(a => a.id === user.id)
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Kicked')
            .addField('Reason', reason)
            .addField('Kicked by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        if(user.kickable){
            await user.kick(reason)
            user = interaction.options.getUser('user')
            await punish(reason,user,interaction.member,"kick",interaction)
        }else {
           return await interaction.reply({content: "Can't kick this user", ephemeral:true})
        }
        await interaction.reply({embeds: [embed]})
        let channel = interaction.guild.channels.cache.find(a=> a.name.includes("logs"))
        if(!channel){return;}
        const logEmbed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Kicked')
            .addField('General Info', `User Kicked: ${user.toString()} \`${user.id}\`\n Reason:\`${reason}\``)
            .addField('Kicked by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        return channel.send({embeds: [logEmbed]})
    },
};
