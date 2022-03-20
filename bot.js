const fs = require('node:fs');
const path = require('path')
const { Client, Collection, Intents, MessageEmbed} = require('discord.js');
const { token } = require('./config.json');
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
client.login(token);
let levels = [20,40,70,130,190,250,310,400,640,1000,1650,2500,5000,8000,13000,19000,27000,40000,60000,850000,100000]
client.on('messageCreate', async message => {
	if(message.author.bot)return;
	if(!message.guild) return;
	let db = new sqlite.Database(path.join(path.resolve('./databases/'), `${message.guild.id}.db`), sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
	db.run(`CREATE TABLE IF NOT EXISTS data(UserTag TEXT NOT NULL, UserID INTEGER NOT NULL,  Messages INTEGER NOT NULL, level INTEGER NOT NULL)`) // data table : 4 rows
	db.run(`CREATE TABLE IF NOT EXISTS cases(Reason TEXT NOT NULL, UserID INTEGER NOT NULL , UserTag TEXT NOT NULL, ModeratorTag TEXT NOT NULL, ModeratorID INTEGER NOT NULL, CaseType TEXT NOT NULL , Date TEXT NUT NULL)`)

	await db.get(`SELECT * FROM data WHERE UserID = ${message.author.id}`, async (err,row) => {
		if(err){
			return console.log(err);
		}
		if(row === undefined){
			db.run(`INSERT INTO data VALUES (?,?,?,?)`,[message.author.tag,message.author.id,1,1])
		}else {
			db.run(`UPDATE data SET Messages = ? WHERE UserID = ?`,[row.Messages + 1, message.author.id])
			for (let i = 0; i < levels.length; i++){
				if(row.Messages === levels[i]){
					message.channel.send({content: `Congratulations ${message.author.toString()} you reached level ${i +1}`})
				}
			}
		}
	})
})
client.on('messageUpdate',async(oldMessage,newMessage) => {
	if(newMessage.author.bot){
		return;
	}
	if(!newMessage.guild){return;}
	if(oldMessage.content.includes("https")){return;}
	const logsChannel = newMessage.guild.channels.cache.find(a => a.name === "logs")
	if(!logsChannel){return;}
	const embed = new MessageEmbed()
		.setTitle('Message Edited')
		.setTimestamp()
		.addField('Old Message', `\`\`\`${oldMessage.content}\`\`\``,true)
		.addField('New Message', `\`\`\`${newMessage.content}\`\`\``,true)
		.addField('Message Info', `Channel: ${newMessage.channel.toString()}\n Author: ${newMessage.author.toString()}\n Link: [Message](${newMessage.url})`,true)
	return logsChannel.send({embeds: [embed]})
})
client.on('messageDelete', async messageDelete =>{
	if(messageDelete.author.bot){return;}
	if(!messageDelete.guild){return;}
	const logsChannel = messageDelete.guild.channels.cache.find(channel => channel.name === "logs");
	if(!logsChannel){return;}

	const embed = new MessageEmbed()
		.setTitle('Message Deleted')
		.addField('Message', `\`\`\`${messageDelete.content}\`\`\``,true)
		.addField('Info', `Channel: ${messageDelete.channel.toString()}\n Author: ${messageDelete.author.toString()}`)
		.setTimestamp()

	return logsChannel.send({embeds: [embed]})
})
client.on('messageDeleteBulk', async (messages) =>{
	const logsChannel = messages.first().guild.channels.cache.find(a => a.name === "logs")
	if(!logsChannel){return;}
	let texto = "";
	messages.forEach((e) =>{
		texto += `${e.author.tag}: ${e.content}\n`
	})
	const embed = new MessageEmbed()
		.setTitle(`${messages.size + 1} Messages Deleted`)
		.setDescription(`\`\`\`${texto}\`\`\``)
		.setTimestamp()
	logsChannel.send({embeds:[embed]})

})
client.on('guildMemberAdd', async member =>{
	const logsChannel = member.guild.channels.cache.find(a => a.name === "logs")
	if(!logsChannel){return;}
	await member.fetch
	const embed = new MessageEmbed()
		.setTitle('User Joined')
		.addField('User Info', `Mention: ${member.toString()}\n ID: ${member.id.toString()}\n Account Creation Date: \`${moment(member.user.createdAt).format('DD/MM/YYYY hh:mm:ss')}\` ${moment(member.user.createdTimestamp).fromNow()} `)
		.setTimestamp()
		.setThumbnail(member.avatarURL())

	logsChannel.send({embeds: [embed]})
})
client.on('guildMemberRemove', async member =>{
	const logsChannel = member.guild.channels.cache.find(a => a.name === "logs")
	if(!logsChannel){return;}
	const embed = new MessageEmbed()
		.setTitle('User Left')
		.addField('User Info', `Mention: ${member.toString()}\n ID: ${member.id.toString()}\n Account Creation Date: \`${moment(member.user.createdAt).format('DD/MM/YYYY hh:mm:ss')}\` ${moment(member.user.createdTimestamp).fromNow()}\n Joined Date: \`${moment(member.joinedAt).format('DD/MM/YYYY hh:mm:ss')}\` ${moment(member.joinedTimestamp).fromNow()}`)
		.setTimestamp()

	logsChannel.send({embeds: [embed]})
})
