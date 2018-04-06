const config = require('./config.json');
const bots = require('./bots.json');
const Discord = require('discord.js');

bots.forEach(function (bot)
  {
    const client = new Discord.Client();

    client.on('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`);
    });

    let commandNotTimeouted = true;

    client.on('message', function (message)
      {
        if (commandNotTimeouted &&
            (message.member.voiceChannelID == bot.channel) &&
            (message.content.length > config.command.length) &&
            message.content.startsWith(config.command))
        {
          //Prevent spam by setting a timeout for the command (client specific):
          commandNotTimeouted = false;
          client.setTimeout(function () { commandNotTimeouted = true; }, config.commandTimeout);

          let topic = message.content.slice(config.command.length);
          if (topic.length > config.topicMaxLength)
            topic = topic.substr(0, config.topicMaxLength);
        
          message.guild.members.get(client.user.id).setNickname(config.topicPrefix + topic + config.topicSuffix);

          var CheckEmptyChannel;
          message.member.voiceChannel.join()
            .then(function (connection)
              {
                //Disconnect when there is only the bot left in the channel:
                clearInterval(CheckEmptyChannel);
                CheckEmptyChannel = client.setInterval(function ()
                  {
                    try
                    {
                      if (connection.channel.members.size <= 1)
                      {
                        connection.disconnect();
                        clearInterval(CheckEmptyChannel);
                      }
                    }
                    catch (e) //Probably broken connection, so already disconnected.
                    {
                      clearInterval(CheckEmptyChannel);
                    }
                  }, config.intervallTime
                );
              }
          );
        }
      }
    );

    client.login(bot.token);
  }
);