import { 
	EmbedBuilder, 
	ButtonBuilder, 
	ButtonStyle 
} from 'discord.js';

import { ActionRowBuilder } from '@discordjs/builders';
import Conversation from '../models/conversation.js';

import { splitMessages } from '../utils.js';

export default (api) => async (message) => {
	if (message.channel.name === "bot" && !message.author.bot) {
		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('ChatGPT')
			.setURL('https://chat.openai.com/')
			.setDescription('Create a new thread to interact with ChatGPT!')
			.setTimestamp()

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('create-new-thread')
					.setLabel('Create new Thread')
					.setStyle(ButtonStyle.Primary),
			);

		message.channel.send({ embeds: [exampleEmbed], components: [row] });
	}

	if (message.channel.parent.name === process.env.CHANNEL_NAME && !message.author.bot) {
		try {
			const existingConversation = await Conversation.findOne({ threadId: message.channelId });
			message.channel.sendTyping();
      let res;

			if (existingConversation) {
				res = await api.sendMessage(message.content, 
					{ parentMessageId: existingConversation.lastMessageId }
				);
				existingConversation.lastMessageId = res.id;
				existingConversation.save();
			} else {
				const newConversation = new Conversation({ threadId: message.channelId });
				res = await api.sendMessage(message.content);
				newConversation.lastMessageId = res.id;
				newConversation.save();
			}

      const messages = splitMessages(res.text);

      for (const eachMessage of messages) {
        message.channel.send(eachMessage);
      }
		} catch (error) {
			message.channel.send(`Something went wrong! ${error}`);
		}
	}
}