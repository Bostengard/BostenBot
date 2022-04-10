const path = require('path')
const sqlite = require('sqlite3')

module.exports.CreateDatabase =
    async function createDatabase(id) {
        let db = new sqlite.Database(path.join(path.resolve('./Databases/'), `${id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
        db.run(`CREATE TABLE IF NOT EXISTS data
                (
                    UserTag  TEXT    NOT NULL,
                    UserID   VARCHAR(64) NOT NULL,
                    Messages INTEGER NOT NULL,
                    level    INTEGER NOT NULL
                )`) // data table : 4 rows
        db.run(`CREATE TABLE IF NOT EXISTS cases
                (
                    Reason       TEXT     NOT NULL,
                    UserID       VARCHAR(64)  NOT NULL,
                    UserTag      TEXT     NOT NULL,
                    ModeratorTag TEXT     NOT NULL,
                    ModeratorID  VARCHAR(64)  NOT NULL,
                    CaseType     TEXT     NOT NULL,
                    Date         TEXT NUT NULL
                )`)
        db.run(`CREATE TABLE IF NOT EXISTS ServerSettings
                (
                    WelcomeChannel VARCHAR(64),
                    LogsChannel    VARCHAR(64),
                    WelcomeRole    VARCHAR(64),
                    LevelChannel   VARCHAR(64),
                    WelcomeImage   TEXT
                )`)
        return true;
    }