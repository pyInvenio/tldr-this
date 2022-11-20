import { ApplicationCommandType, ButtonStyle, Client, CommandInteraction, ChatInputCommandInteraction} from 'discord.js';
import { Command } from '../interfaces/Command';
// at the top of your file
import { EmbedBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder } from 'discord.js';
// Constants
const { pagination, TypesButtons, StylesButton } = require('@devraelfreeze/discordjs-pagination');

const backId = 'back';
const forwardId = 'forward';
const backButton = new ButtonBuilder({
  style: ButtonStyle.Secondary,
  label: 'Back',
  emoji: '⬅️',
  customId: backId,
});
const forwardButton = new ButtonBuilder({
  style: ButtonStyle.Secondary,
  label: 'Forward',
  emoji: '➡️',
  customId: forwardId,
});

const messageDict = {
  Topics: ['Persona', 'Danganronpa', 'Cohere sucks lol'],
  Summaries: {
    '0-200': [
      "Mr. Smith's getting a check-up, and Doctor Hawkins advises him to have one every year. Hawkins'll give some information about their classes and medications to help Mr. Smith quit smoking.",
      'https://discord.com/developers/docs/interactions/receiving-and-responding',
    ],
    '201-400': [
      "Malik invites Nikki to dance. Nikki agrees if Malik doesn't mind getting his feet stepped on.",
      'https://discord.com/developers/docs/interactions/receiving-and-responding',
    ],
    '401-600': [
      "#Person1#'s angry because #Person2# didn't tell #Person1# that #Person2# had a girlfriend and would marry her.",
      'https://discord.com/developers/docs/interactions/receiving-and-responding',
    ],
    '601-800': [
      "#Person1#'s looking for a set of keys and asks for #Person2#'s help to find them.",
      'https://discord.com/developers/docs/interactions/receiving-and-responding',
    ],
    '801-1000': [
      'Mrs Parker takes Ricky for his vaccines. Dr. Peters checks the record and then gives Ricky a vaccine.',
      'https://discord.com/developers/docs/interactions/receiving-and-responding',
    ],
  },
};

export const TextEmbed: Command = {
  name: 'textout',
  description: 'Returns the summary embedded',
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    var pages = []
    
    for (const [key, value] of Object.entries(messageDict['Summaries'])) {
      const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Your Taldera Summary')
      .setURL('https://discord.js.org/')
      .setAuthor({
        name: 'Taldera',
        iconURL:
          'https://www.howtogeek.com/wp-content/uploads/2019/08/the-word-tldr-in-big-yellow-letters-against-a-black-background.jpeg?height=200p&trim=2,2,2,2',
      })
      .setTimestamp();
      exampleEmbed.addFields({
        name: key,
        value: '['.concat(value[0], '](', value[1], ')'),
        inline: false,
      });
      pages.push(exampleEmbed)
    }
    // await interaction.followUp({
    //   ephemeral: true,
    //   embeds: [exampleEmbed],
    // }).then(

    // );
    await pagination({
      embeds: pages, // Array of embeds objects
      author: interaction.member?.user,
      interaction: interaction,
      ephemeral: true,
      time: 120000, // 120 seconds
      disableButtons: true, // Remove buttons after timeout
      fastSkip: false,
      pageTravel: false,
      
      buttons: [
          {
              value: TypesButtons.previous,
              label: 'Previous Page',
              style: StylesButton.Primary
          },
          {
              value: TypesButtons.next,
              label: 'Next Page',
              style: StylesButton.Success
          }
      ]
  });
  },
};
