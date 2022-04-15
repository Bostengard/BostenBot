const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");
const { punish } = require(path.resolve('./Functions/punish.js'));
const sqlite = require('sqlite3')



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
            .addField('Banned:', user.toString())
            .addField('Banned by', interaction.user.toString() + `\`${interaction.user.id}\`\n Reason: ${reason}`)
            .setTimestamp()
        if(user.bannable){
            await user.ban(user,{reason: reason})
            user = interaction.options.getUser('user')
            await punish(reason,user,interaction.member,"ban",interaction)
        }else {
            return await interaction.reply({content: "Can't ban this user", ephemeral:true})
        }
        await interaction.reply({embeds: [embed]})

        const logEmbed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('User Banned')
            .addField('General Info', `User Banned: ${user.toString()} \`${user.id}\`\n Reason:\`${reason}\``)
            .addField('Banned by', interaction.user.toString() + `\`${interaction.user.id}\``)
            .setTimestamp()
        client.CreateDatabase(interaction.guild.id)
        let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        let ID;
        let channel;
        db.get(`SELECT * FROM ServerSettings`, async (err,row) =>{
            if(err) return interaction.reply({content: "There was an error while executing the command",ephemeral: true})
            if(row === undefined) return db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?,?)`,[0,0,0,0,0])
            ID = row.LogsChannel
            try{
                await interaction.guild.channels.fetch(`${ID}`)
                channel  = await interaction.guild.channels.cache.get(ID)
                channel.send({embeds: [logEmbed]})
            }
            catch{
            }
        })
    },
};
