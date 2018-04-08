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
        
          var clientMember = message.guild.members.get(client.user.id);
          clientMember.setNickname(config.topicPrefix + topic + config.topicSuffix);

          var checkEmptyChannel;
          message.member.voiceChannel.join()
            .then(function (connection)
              {
                //Disconnect when there is only the bot left in the channel:
                clearInterval(checkEmptyChannel);
                checkEmptyChannel = client.setInterval(function ()
                  {
                    try
                    {
                      if (connection.channel.members.size <= 1)
                      {
                        clientMember.setNickname(config.botName);
                        connection.disconnect();
                      }
                    }
                    finally
                    {
                      clearInterval(checkEmptyChannel);
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