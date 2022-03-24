const fs = require('node:fs');
const path = require('path')
const { Client, Collection, Intents, MessageEmbed} = require('discord.js');
const token  = require(path.resolve('./config.json')).token;
const { Player } = require('discord-music-player')
const moment = require('moment')
const client = new Client({ intents: new Intents(32767) });
const sqlite = require('sqlite3').verbose()
const player = new Player(client, {
	leaveOnEmpty:true,
	deafenOnJoin:true,
	timeout: 1000,
})
client.player = player
//setting up slash commands
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.resolve('./SlashCommands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(path.resolve(`./SlashCommands/${file}`));
	client.commands.set(command.data.name, command);
}
client.once('ready', () => {
	console.log('Ready!');
});
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;


	try {
		await command.execute(interaction,client);
	} catch (error) {
		console.error(error);
	}
});

let levels = [20,40,70,130,190,250,310,400,640,1000,1650,2500,5000,8000,13000,19000,27000,40000,60000,850000,100000]
client.on('messageCreate', async message => {
	if(message.author.bot)return;
	if(!message.guild) return;
	if(message.webhookId) return;
	let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${message.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
	db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
	db.run(`CREATE TABLE IF NOT EXISTS ServerSettings(WelcomeChannel VARCHAR(64),LogsChannel VARCHAR(64),WelcomeRole VARCHAR(64), LevelChannel VARCHAR(64))`)
	await db.get(`SELECT * FROM data WHERE UserID = ${message.author.id}`, async (err,row) => {
		if(err){
			return console.log(err);
		}
		if(row === undefined){
			return db.run(`INSERT INTO data VALUES (?,?,?,?)`,[message.author.tag,message.author.id,1,1])
		}else {
			db.run(`UPDATE data SET Messages = ? WHERE UserID = ?`,[row.Messages + 1, message.author.id])
			for (let i = 0; i < levels.length; i++){
				if(row.Messages === levels[i]){
					let ID;
					await db.get(`SELECT * FROM ServerSettings`, async (err,row) =>{
						if(err) return;
						if(row === undefined){return db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?)`,[0,0,0,0])}
						ID = row.WelcomeChannel
						try{
							await message.guild.channels.fetch(`${ID}`)
						}catch{
							return message.channel.send({content: `Congratulations ${message.author.toString()} you reached level ${i +1}!`})
						}
						let channel = await message.guild.channels.cache.get(ID)
						channel.send({content: `Congratulations ${message.author.toString()} You reached Level ${i+1}!`})
					})
				}
			}
		}
	})
	await db.get(`SELECT * FROM ServerSettings`, async (err,row) => {
		if(err) return;
		if(row === undefined){
			db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?)`, [0,0,0,0])
		}
	})

})
client.on('messageUpdate',async(oldMessage,newMessage) => {
	if(newMessage.author.bot){
		return;
	}
	if(!newMessage.guild){return;}
	if(oldMessage.content.includes("https")){return;}
	let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${newMessage.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
	db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
	db.run(`CREATE TABLE IF NOT EXISTS ServerSettings(WelcomeChannel VARCHAR(64),LogsChannel VARCHAR(64),WelcomeRole VARCHAR(64), LevelChannel VARCHAR(64))`)
	let logsChannel;
	await db.get(`Select * FROM ServerSettings`,async (err,row) =>{
		if(err) return;
		console.log(row)
		if(row === undefined) db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?)`,[0,0,0,0])

		const ID = row.LogsChannel
		try{
			await newMessage.guild.channels.fetch(`${ID}`)
		}catch{
			return;
		}
		logsChannel = await newMessage.guild.channels.cache.get(ID)
		console.log(logsChannel)
		const embed = new MessageEmbed()
			.setTitle('Message Edited')
			.setTimestamp()
			.addField('Old Message', `\`\`\`${oldMessage.content}\`\`\``,true)
			.addField('New Message', `\`\`\`${newMessage.content}\`\`\``,true)
			.addField('Message Info', `Channel: ${newMessage.channel.toString()}\n Author: ${newMessage.author.toString()}\n Link: [Message](${newMessage.url})`,true)
		try {
			return logsChannel.send({embeds: [embed]})
		}catch (e) {
			console.log(e)
		}
	})



})
client.on('messageDelete', async messageDelete =>{
	if(messageDelete.author.bot){return;}
	if(!messageDelete.guild){return;}
	let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${messageDelete.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
	db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
	db.run(`CREATE TABLE IF NOT EXISTS ServerSettings(WelcomeChannel VARCHAR(64),LogsChannel VARCHAR(64),WelcomeRole VARCHAR(64), LevelChannel VARCHAR(64))`)
	let logsChannel;
	await db.get(`Select * FROM ServerSettings`,async (err,row) =>{
		if(err) return;
		console.log(row)
		if(row === undefined) db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?)`,[0,0,0,0])

		const ID = row.LogsChannel
		try{
			await messageDelete.guild.channels.fetch(`${ID}`)
		}catch {
			return;
		}


		logsChannel = await messageDelete.guild.channels.cache.get(ID)
		console.log(logsChannel)
		const embed = new MessageEmbed()
			.setTitle('Message Deleted')
			.addField('Message', `\`\`\`${messageDelete.content}\`\`\``,true)
			.addField('Info', `Channel: ${messageDelete.channel.toString()}\n Author: ${messageDelete.author.toString()}`)
			.setTimestamp()
		try {
			return logsChannel.send({embeds: [embed]})
		}catch (e) {
			console.log(e)
		}
	})
})
client.on('messageDeleteBulk', async (messages) =>{
	let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${messages.first().guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
	db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
	db.run(`CREATE TABLE IF NOT EXISTS ServerSettings(WelcomeChannel VARCHAR(64),LogsChannel VARCHAR(64),WelcomeRole VARCHAR(64), LevelChannel VARCHAR(64))`)

	await db.get(`Select * FROM ServerSettings`,async (err,row) =>{
		if(err) return;
		let logsChannel;
		if(row === undefined) db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?)`,[0,0,0,0])
		const ID = row.LogsChannel;
		try {
			await messages.first().guild.channels.fetch(`${ID}`)
		}catch {
			return ;
		}

		logsChannel = await messages.first().guild.channels.cache.get(ID)
		console.log(logsChannel)
		let texto = "";
		messages.forEach((e) =>{
			texto += `${e.author.tag}: ${e.content}\n`
		})
		const embed = new MessageEmbed()
			.setTitle(`${messages.size + 1} Messages Deleted`)
			.setDescription(`\`\`\`${texto}\`\`\``)
			.setTimestamp()
		try {
			return logsChannel.send({embeds: [embed]})
		}catch (e) {
			console.log(e)
		}
	})

})
client.on('guildMemberAdd', async member =>{
	let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${member.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
	db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
	db.run(`CREATE TABLE IF NOT EXISTS ServerSettings(WelcomeChannel VARCHAR(64),LogsChannel VARCHAR(64),WelcomeRole VARCHAR(64), LevelChannel VARCHAR(64))`)
	let role;
	let logsChannel;
	let welcomeChannel
	await member.guild.roles.fetch()
	await db.get(`Select * FROM ServerSettings`,async (err,row) =>{
		if(err) return;
		if(row === undefined){db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?)`,[0,0,0,0])}
		const roleId = row.WelcomeRole
		const ID = row.LogsChannel;
		const WelcomeID = row.WelcomeChannel
		//get the logschannel and send message
		if(ID !== 0){
			try{await member.guild.channels.fetch(`${ID}`)}catch{
			}
			logsChannel = await member.guild.channels.cache.get(ID)
			try {
				await member.fetch
				const embed = new MessageEmbed()
					.setTitle('User Joined')
					.addField('User Info', `Mention: ${member.toString()}\n ID: ${member.id.toString()}\n Account Creation Date: \`${moment(member.user.createdAt).format('DD/MM/YYYY hh:mm:ss')}\` ${moment(member.user.createdTimestamp).fromNow()} `)
					.setTimestamp()
					.setThumbnail(member.avatarURL())
				await logsChannel.send({embeds: [embed]})
			}catch{
			}
		}
		if(roleId !== 0){
			//get the role
			try{await  member.guild.roles.fetch(`${roleId}`)}catch {

			}
			role = await member.guild.roles.cache.get(roleId)
			//add role
			try{
				await member.roles.add(role)
			}catch{

			}
		}
		if(WelcomeID !== 0){
			//get the welcome channel
			try{await member.guild.channels.fetch(`${WelcomeID}`)}catch{

			}
			welcomeChannel = await member.guild.channels.cache.get(WelcomeID)
			try{await welcomeChannel.send(`${member.toString()} welcome to ${member.guild.name}!`)}catch{
			}
		}




	})
})
client.on('guildMemberRemove', async member =>{
	let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${member.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
	db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)
	db.run(`CREATE TABLE IF NOT EXISTS ServerSettings(WelcomeChannel VARCHAR(64),LogsChannel VARCHAR(64),WelcomeRole VARCHAR(64), LevelChannel VARCHAR(64))`)
	let logsChannel;
	await db.get(`Select * FROM ServerSettings`,async (err,row) => {
		if (err) return;
		console.log(row)
		if (row === undefined) db.run(`INSERT INTO ServerSettings VALUES (?,?,?,?)`, [0, 0, 0, 0])

		const ID = row.LogsChannel

		await member.guild.channels.fetch(`${ID}`)
		logsChannel = await member.guild.channels.cache.get(ID)
		console.log(logsChannel)
		const embed = new MessageEmbed()
			.setTitle('User Left')
			.addField('User Info', `Mention: ${member.toString()}\n ID: ${member.id.toString()}\n Account Creation Date: \`${moment(member.user.createdAt).format('DD/MM/YYYY hh:mm:ss')}\` ${moment(member.user.createdTimestamp).fromNow()}\n Joined Date: \`${moment(member.joinedAt).format('DD/MM/YYYY hh:mm:ss')}\` ${moment(member.joinedTimestamp).fromNow()}`)
			.setTimestamp()
		try {
			return logsChannel.send({embeds: [embed]})
		} catch (e) {
			console.log(e)
		}
	})

})
client.login(token);