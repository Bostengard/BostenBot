const { SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const moment = require('moment')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Shows info for the current server'),
    async execute(interaction,client) {
        await interaction.deferReply()
        await interaction.guild.fetch()
        let rolemap = interaction.guild.roles.cache.sort((a,b) => b.position - a.position).map(r => r).join(" ")
        if(rolemap.length > 1024) rolemap = "Too many roles";
        let ServerOwner = interaction.guild.members.cache.find(member => member.id === interaction.guild.ownerId)
        let Administrator = interaction.guild.members.cache.filter(member => member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)).filter(member => !member.user.bot).size
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('Server Info')
            .setDescription(`Showing info for ${interaction.guild.name}`)
            .addField(`Members`, `Total Members: \`${interaction.guild.memberCount}\`\nBots: \`${interaction.guild.members.cache.filter(member => member.user.bot).size}\`\n Administrators: \`${Administrator}\``)
            .addField(`Server`, `Created At: \`${moment(interaction.guild.createdAt).format("DD/MM/YY")}\` ${moment(interaction.guild.createdTimestamp).fromNow()} \nServer Owner: ${ServerOwner} \n Guild ID: \`${interaction.guildId}\` `)
            .addField('Roles', rolemap)
            .setThumbnail(interaction.guild.iconURL({format:"png", dynamic: true, size: 2048}))
            .setImage(interaction.guild.bannerURL({format: "png", dynamic: true, size: 2048}))
            .setTimestamp()
        return interaction.editReply({embeds: [embed]})
    },
};
