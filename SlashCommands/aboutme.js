const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, User} = require('discord.js');
const moment = require('moment')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('aboutme')
        .setDescription('Tells you info about you or a person')
        .addUserOption(option => option.setName('target').setDescription('The person you would like to know more about').setRequired(true)),
    async execute(interaction,client) {
        await interaction.deferReply({})
        let value = interaction.options.getUser('target')
        if(!value){
            value = interaction.user.id
        }
        const GuildTarget = interaction.guild.members.cache.find(member => member.id === value.id)
        const UserTarget = value
        let rolemap = GuildTarget.roles.cache.sort((a,b) => b.position - a.position).map(r => r).join(" ")
        if(rolemap.length > 1024){rolemap = "Too many roles"}
        if(!rolemap){rolemap = "no roles"}
        await UserTarget.fetch()
        let usertag = GuildTarget.nick; if(!usertag){usertag = UserTarget.tag}
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle(`Info About ${usertag}`)
            .addField(`User ID, Mention and Nickname`, `ID: \`${value.id}\`\nMention: ${GuildTarget.toString()}\n Nickname: \`${usertag} \``)
            .addField('Joined At', `  \`${moment.utc(GuildTarget.joinedAt).format("DD/MM/YY h:mm:ss a")}\`   \n ${moment(GuildTarget.joinedTimestamp).fromNow()}`,true)
            .addField('Created AT', `  \`${moment.utc(UserTarget.createdAt).format("DD/MM/YY h:mm:ss a")}\`  \n ${moment(UserTarget.createdTimestamp).fromNow()}`,true)
            .addField('\u200b', '\u200b',true)
            .addField('Highest Role', GuildTarget.roles.highest.toString(),true)
            .addField('Roles', rolemap,true)
            .setThumbnail(UserTarget.avatarURL({format: 'png', dynamic: true, size: 2048}) || UserTarget.defaultAvatarURL)
            .setImage(UserTarget.bannerURL({format: 'png', dynamic: true, size: 2048}))
            .setTimestamp()
        return interaction.editReply({embeds: [embed], ephemeral: false})
    },
};
