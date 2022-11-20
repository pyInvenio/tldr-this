import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Client,
  CommandInteraction,
  Message,
} from 'discord.js';
import { Command } from '../interfaces/Command';
import getSummary from '../helpers/getSummary';
import embedResults from '../helpers/embedResults';
import * as chrono from 'chrono-node'; // natural language time processing

let in_use = false;

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
      max_value: 6400,
      required: false,
    },
    {
      name: 'from',
      description: 'Get summary of messages from time range',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'format',
      description: 'Format of the summaries',
      type: ApplicationCommandOptionType.Integer,
      choices: [
        { name: 'Embed', value: 0 },
        { name: 'Text', value: 1 },
        { name: 'File', value: 2 },
      ],
      required: false,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    // global.someAttributeName:Boolean = true;

    if (in_use) {
      await interaction.followUp({
        ephemeral: true,
        content:
          'Sorry, this command is already in use. Please try again later.',
      });
      return;
    }
    in_use = true;

    const date = chrono.parse(interaction.options.get('from')?.value as string);
    const dateFrom = date.length ? new Date(date[0].start.date()) : null;

    const format = (interaction.options.get('format')?.value as number) || 0;

    const length = (interaction.options.get('length')?.value as number) || 30;
    const collected_messages: Message[] = [];

    if (!interaction.channel) {
      await interaction.followUp({
        ephemeral: true,
        content: 'Error: Channel was undefined',
      });
      return;
    }

    const bot_message = await interaction.followUp({
      ephemeral: true,
      content: `Gathering ${length} messages...`,
    });

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
            const msgDate = new Date(msg.createdTimestamp); // msg.createdTimestamp in ms

            if (
              !(dateFrom && msgDate < dateFrom) &&
              msg.author.id !== process.env.CLIENT_ID
            )
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

    bot_message.edit(`Summarizing ${length} messages...`);

    const summaries = await getSummary(
      collected_messages.reverse(),
      bot_message
    );

    bot_message.edit('**Summary**');

    switch (format) {
      case 0:
        embedResults(summaries, interaction);
        break;
      case 1:
        const max = 2000;
        let summary = '';
        summaries.forEach((s) => {
          let entry = `*${s.start} - ${s.end}*\n>${s.content}\n\n`;
          if (summary.length + entry.length > max) {
            bot_message.channel.send(summary);
            summary = '';
          }
          summary += entry;
        });
        if (summary.length > 0) bot_message.channel.send(summary);
        break;
      case 2:
        const buffer = Buffer.from(
          summaries
            .map((s) => `[${s.start} - ${s.end}]\n${s.content}\n\n`)
            .join('')
        );
        console.log(buffer, buffer.length);
        bot_message.channel.send({
          files: [{ attachment: buffer, name: 'summary.txt' }],
        });
        break;
    }

    in_use = false;
  },
};
