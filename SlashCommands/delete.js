const { SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require('path')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletes a number (max99) of messages')
        .addIntegerOption(option => option.setName('messages').setDescription('the message to be deleted').setRequired(true)),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))return interaction.reply({content: "Missing Permissions", ephemeral: true})
        let value = interaction.options.getInteger('messages')
        if(value > 99){return interaction.reply({content: "Max 99 Messages", ephemeral: true})}

        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle(`Deleted ${value} messages`)
            .addField(`Deleted By`, `${interaction.user.toString()}`)
            .setTimestamp()
        try{
            await interaction.channel.bulkDelete(value)
        }catch {
            return await interaction.reply({content: "Messages are to old to be deleted", ephemeral: true})
        }
        interaction.reply({embeds: [embed]})
        let channel = interaction.guild.channels.cache.find(a=> a.name.includes("logs"))
        if(!channel){return;}
        return channel.send({embeds: [embed]})

    },
};
