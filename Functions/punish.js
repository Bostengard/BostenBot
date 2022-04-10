const path = require("path");
const sqlite = require('sqlite3').verbose()

const moment = require('moment')
module.exports.punish = async function punish(reason,victim,moderator,type,interaction){
        let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${interaction.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
        db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
        db.run(`INSERT INTO cases VALUES(?,?,?,?,?,?,?)`,[reason,victim.id,victim.tag,interaction.user.tag,interaction.user.id,type,moment(Date.now()).format('DD/MM/YYYY')])
        return true;

}