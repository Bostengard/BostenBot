const { ShardingManager } = require('discord.js');
const path = require('path')
const configPath = path.resolve('./Config.json')
const botPath = path.resolve('./bot.js')
const token = require(configPath).token
const manager = new ShardingManager(botPath, { token: token });
manager.on('shardCreate', async shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();