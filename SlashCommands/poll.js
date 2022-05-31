const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");



module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll')
        .addStringOption(option => option.setName('title').setDescription('the title of the poll').setRequired(true))
        .addStringOption(option => option.setName('option1').setDescription('first option').setRequired(true))
        .addStringOption(option => option.setName('option2').setDescription('first option').setRequired(true))
        .addStringOption(option => option.setName('option3').setDescription('first option').setRequired(false))
        .addStringOption(option => option.setName('option4').setDescription('first option').setRequired(false))
        .addStringOption(option => option.setName('option5').setDescription('first option').setRequired(false))
        .addStringOption(option => option.setName('option6').setDescription('first option').setRequired(false))
        .addStringOption(option => option.setName('option7').setDescription('first option').setRequired(false))
        .addStringOption(option => option.setName('option8').setDescription('first option').setRequired(false))
        .addStringOption(option => option.setName('option9').setDescription('first option').setRequired(false))
        .addStringOption(option => option.setName('option10').setDescription('first option').setRequired(false)),
    async execute(interaction,client) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)){
            return interaction.reply({content: "Missing permissions", ephemeral: true})
        }
        let title = interaction.options.getString(`title`)
        let option1 = interaction.options.getString(`option1`)
        let option2 = interaction.options.getString(`option2`)
        let option3 = interaction.options.getString(`option3`)
        let option4 = interaction.options.getString(`option4`)
        let option5 = interaction.options.getString(`option5`)
        let option6 = interaction.options.getString(`option6`)
        let option7 = interaction.options.getString(`option7`)
        let option8 = interaction.options.getString(`option8`)
        let option9 = interaction.options.getString(`option9`)
        let option10 = interaction.options.getString(`option10`)

        let text = `1- ${option1} 
                    2- ${option2} \n`;
        let reactions = ["1️⃣","2️⃣"]
        if(option3) {
            text = text + `3- ${option3} \n`;
            reactions.push("3️⃣")
        }
        if(option4) {
            text = text + `4- ${option4} \n`;
            reactions.push("4️⃣")
        }
        if(option5) {
            text = text + `5- ${option5} \n `;
            reactions.push("5️⃣")
        }
        if(option6) {
            text = text + `6- ${option6}\n `;
            reactions.push('6️⃣')
        }
        if(option7) {
            text = text + `7- ${option7}\n`;
            reactions.push('7️⃣')
        }
        if(option8) {
            text = text + `8- ${option8}\n`;
            reactions.push('8️⃣')
        }
        if(option9) {
            text = text + `9- ${option9}\n`;
            reactions.push('9️⃣')
        }
        if(option10) {
            text = text + `10- ${option10}\n`;
            reactions.push('🔟')
        }
        await interaction.user.fetch
        let embed = new MessageEmbed()
            .setTitle(`${title}`)
            .setDescription(text)
            .setFooter({text: `poll created by ${interaction.user.tag}`,iconURL: interaction.user.displayAvatarURL({format: "jpg", size: 2048, dynamic: true}) || interaction.user.defaultAvatarURL})
        await interaction.reply({ephemeral: true, content: "Poll created! lets see the votes"})

        let message = await interaction.channel.send({embeds: [embed]})

        reactions.forEach(function (emoji){
            message.react(emoji)
        })

    },
};
