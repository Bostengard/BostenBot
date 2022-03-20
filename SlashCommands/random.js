const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Selects a random Number')
        .addIntegerOption(option => option.setName('max_number').setDescription('The maximum number to be random').setRequired(false)),
    async execute(interaction,client) {
        let value = interaction.options.getInteger('max_number')
        if(!value){value = 10}
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('Random Number')
            .addField(`> ${Math.floor(Math.random() * value)}`, `Random number between 0 and ${value}`)
            .setTimestamp()
        return interaction.reply({embeds: [embed]})
    },
};
