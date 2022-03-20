const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require('discord.js');
const path = require("path");
const sqlite = require('sqlite3').verbose()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cases')
        .setDescription('Shows all the cases for a user')
        .addUserOption(option => option.setName('user').setDescription('Who would you like to investigate').setRequired(true)),
    async execute(interaction,client) {
        await interaction.deferReply({})
        if(!interaction.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) return  interaction.editReply({content: "missing permissions"})
        let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
        db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
        const user = interaction.options.getUser('user')
        await user.fetch()
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setTitle('Cases')
            .setDescription('This user has no cases')

        await db.all(`SELECT * FROM cases WHERE UserID = ?`,[user.id], async (err,row) =>{
            if(err){return interaction.editReply({content:"There has been an error while executing that command"})}
            let amount = 1
            await row.forEach(function (row){
                embed.addField(`Case ${amount}: ${row.CaseType}`, `Reason: \`${row.Reason}\`\nBy: ${row.ModeratorTag}\nAt: \`${row.Date}\``,true)
                embed.setDescription('this user has a total of ' + amount + " cases")
                console.log(row)
                amount++
            })
            return interaction.editReply({embeds:[embed]})

        })

    },
};
