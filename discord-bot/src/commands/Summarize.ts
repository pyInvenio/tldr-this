import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Client,
  CommandInteraction,
  Message,
} from 'discord.js';
import { Command } from '../interfaces/Command';
import getSummary from '../helpers/getSummary';

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
    const length = (interaction.options.get('length')?.value as number) || 30;
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

    let left_to_fetch = length;
    while (message) {
      await interaction.channel.messages
        .fetch({ limit: Math.min(100, left_to_fetch), before: message.id })
        .then((messagePage) => {
          messagePage.forEach((msg) => {
            if (msg.author.id !== process.env.CLIENT_ID)
              collected_messages.push(msg);
            else left_to_fetch++;
          });

          // Update our message pointer to be last message in page of messages
          left_to_fetch -= 100;
          message =
            messagePage.size > 0 && left_to_fetch > 0
              ? messagePage.at(messagePage.size - 1)
              : null;
        });
    }

    const bot_message = await interaction.followUp({
      ephemeral: true,
      content: `Summarizing ${length} messages...`,
    });

    const summary = await getSummary(collected_messages.reverse());

    bot_message.edit(
      `**Summary**\n${summary || 'Error while generating summary!'}`
    );
  },
};
