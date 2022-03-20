const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");
const { punish } = require(path.resolve('./Functions/punish.js'));


module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user')
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
        if(!interaction.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)){
            return interaction.reply({content: "Missing permissions", ephemeral: true})
        }
        let user = interaction.options.getUser('user')
        let reason = interaction.options.getString('reason')
        await punish(reason,user,interaction.member,"warn",interaction)
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Warned')
            .addField('Reason', reason)
            .addField('Warned by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        await interaction.reply({embeds: [embed]})
        let channel = interaction.guild.channels.cache.find(a=> a.name.includes("logs"))
        if(!channel){return;}
        const logEmbed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Warned')
            .addField('General Info', `User Warned: ${user.toString()} \`${user.id}\`\n Reason:\`${reason}\``)
            .addField('Warned by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        return channel.send({embeds: [logEmbed]})
    },
};
