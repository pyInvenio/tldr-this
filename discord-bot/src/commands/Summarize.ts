import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Client,
  CommandInteraction,
  Message,
  TextBasedChannel,
} from 'discord.js';
import { Command } from '../interfaces/Command';
import Constants from 'src/Constants';
import cohere from 'cohere-ai';

export const Summarize: Command = {
  name: 'summarize',
  description: 'Returns a greeting',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'length',
      description: 'Amount of messages to summarize',
      type: ApplicationCommandOptionType.Integer,
      min_value: 1,
      max_value: 2000,
      required: false,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    const length = (interaction.options.get('length')?.value as number) || 200;
    const collected_messages: Message[] = [];

    if (!interaction.channel) {
      await interaction.followUp({
        ephemeral: true,
        content: 'Error: Channel was undefined',
      });
      return;
    }

    // Create message pointer
    let message = await interaction.channel.messages
      .fetch({ limit: 1 })
      .then((messagePage) =>
        messagePage.size === 1 ? messagePage.at(0) : null
      );

    let left_to_fetch = length
    while (message) {
      await interaction.channel.messages
        .fetch({ limit: Math.min(100, left_to_fetch), before: message.id })
        .then((messagePage) => {
          messagePage.forEach((msg) => collected_messages.push(msg));

          // Update our message pointer to be last message in page of messages
          left_to_fetch -= 100
          message =
            messagePage.size > 0 && left_to_fetch > 0 ? messagePage.at(messagePage.size - 1) : null;
        });
    }

    console.log(collected_messages);

    const processed_messages = collected_messages
      .reverse()
      .map((message) => `${Constants.Summarizer.USER_PREFIX_TOKEN}${message.author.id}: ${message.content}`)
      .join(' ');
    console.log(processed_messages);

    await interaction.channel.messages
      .fetch({ limit: length, cache: false })
      .then((messages) => console.log(`Received ${messages.size} messages`))
      .catch(console.error);

    const bot_message = await interaction.followUp({
      ephemeral: true,
      content: `Summarized ${length} messages!`,
    });


  },
};
