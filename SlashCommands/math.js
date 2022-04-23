const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed,} = require('discord.js');
const mathjs = require('mathjs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Helps you with math')
        .addStringOption(option => option.setName('operation').setDescription('What would you like me to solve').setRequired(true)),
    async execute(interaction,client) {
        const operation = interaction.options.getString('operation')
        try {
            const embed = new MessageEmbed()
                .setTitle(`${mathjs.evaluate(operation)}`)
            return interaction.reply({embeds: [embed]})
        }catch (e){
            return interaction.reply({content:'Incorrect operation Syntax \n \n`/help math` for more info',ephemeral: true})
        }
    },
};
