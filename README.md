# BostenBot
a discord bot made by bostengard#4691 with Memw#6969's help in NodeJS `v16.16.0` and Discord.JS `v13.7.0`.
**currently broken**

# Installing the bot
To install the bot you need a few dependencies as:

- Installing [NodeJS](https://nodejs.org/en/) `v16.16.0`
- The latest version of [Visual studio build tools for c++ x86/x64](https://visualstudio.microsoft.com/es/downloads/?q=build+tools)
- And install the latest version of [FFmpeg](https://www.ffmpeg.org/download.html)

After you installed the above mentioned dependencies clone this repository and run `npm -i` in the cloned repository root folder.

# Used packages

These are all of the used packages and their versions installed while running `npm -i`.

| Package name         | Version | Description                                                                  |
|----------------------|---------|------------------------------------------------------------------------------|
| @discordjs/builders  | ^0.12.2 | The slash command builder utility used in the V13 version of discord.js      |
| @discordjs/rest      | ^0.4.1  | Discord rest API wrapper to register slash commands                          |
| @discordjs/voice     | ^0.9.1  | Discord.JS utility to interact with voice channels                           |
| @mapbox/node-pre-gyp | ^1.0.9  | C++ compiler for JavaScript packages made in C++                             |
| axios                | ^0.26.1 | HTTP client utility to send HTTP requests to some interest servers           |
| canvas               | ^2.9.1  | HTML canvas wrapper for node.                                                |
| discord-api-types    | ^0.31.2 | Discord API version enumerable package.                                      |
| discord-music-player | ^8.3.2  | 3rd party discord music player utility                                       |
| discord.js           | ^13.7.0 | The main discord API wrapper.                                                |
| mathjs               | ^10.6.0 | More advanced math utility lacking of vulnerabilities unlike Math NODE class |
| moment               | ^2.29.3 | Date time conversion utility                                                 |
| ms                   | ^2.1.3  | Epoch time conversion utility                                                |
| sqlite3              | 5.8.0   | Databases wrapper for SQLite driver.                                         |

# Configuration

The bot uses a JSON file for the configuration, it contains the following values

| Key      | Type   | Description                                                   |
|----------|--------|---------------------------------------------------------------|
| clientId | string | The bot user ID to register the slash commands                |
| guildId  | string | The preferred guild ID to register the private slash commands |
| token    | string | The application auth token for the server requests.           |

The configuration in the JSON file should look like this

```json
{
	"clientId": "0",
	"guildId": "0",
	"token": "Your discord token"
}
```
to change between guild and global slash commands change the function registering the slash commands in `CommandUpdate.js`, read [THIS](https://discordjs.guide/interactions/slash-commands.html#registering-slash-commands) for more info
# Running the bot

first, you want to register your slash commands, to do that run `node CommandUpdate.js`

Once that's done run `node bot.js` to start the bot.

# Disclaimer

My responsability about the bot ends when you change a line of code that's not specified in this README.md, if the bot does something unwanted after you touch a line of code **IT'S NOT MY PROBLEM**

Thanks for downloading this bot.
