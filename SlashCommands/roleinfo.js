const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, User} = require('discord.js');
const moment = require('moment')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('role-info')
        .setDescription('Tells you info about a role')
        .addRoleOption(option => option.setName('role').setDescription('The ID of the role you would like to know more about').setRequired(true)),
    async execute(interaction,client) {
        const keyPermissions = ['ADMINISTRATOR', 'KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'VIEW_AUDIT_LOG', 'MANAGE_MESSAGES', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'MANAGE_ROLES', 'MANAGE_EMOJIS_AND_STICKERS', 'MODERATE_MEMBERS'];
        const role = interaction.options.getRole("role")
        const permissions = role.permissions.toArray();
        const embed = new MessageEmbed()
            .setColor(role.hexColor)
            .setTitle('Role Info')
            .addField('General Info',`Role ID: \`${role.id}\`\n Role Name: \`${role.name}\`\n Role Creation Date: \`${moment(role.createdAt).format("DD/MM/YY")}\` ${moment(role.createdTimestamp).fromNow()}`)
            .addField('Misc',`Color: \`${role.hexColor}\`\n Members: \`${role.members.size}\`\n Mentionable: \`${role.mentionable}\``)
            .addField(`Permissions`, (permissions.includes('ADMINISTRATOR') ? ['ADMINISTRATOR'] : permissions.filter(x => keyPermissions.includes(x))).map(x => {
                return x.split('_').map((y, i) => i === 0 ? y[0] + y.slice(1).toLowerCase() : y.toLowerCase()).join(' ')
            }).join(', ') || 'None')
            .setThumbnail(role.iconURL({format: "png", dynamic: true, size: 2048}))
            .setTimestamp()
        interaction.reply({embeds: [embed]})
    },
};
