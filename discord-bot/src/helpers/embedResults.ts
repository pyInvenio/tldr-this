import { CommandInteraction, Embed, User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { SummarizeResult } from 'src/interfaces/Summarize';
// Constants
import {
  pagination,
  TypesButtons,
  StylesButton,
} from '@devraelfreeze/discordjs-pagination';

export default async function (
  summaries: SummarizeResult[],
  interaction: CommandInteraction
) {
  // name: 'textout',
  // description: 'Returns the summary embedded',
  // type: ApplicationCommandType.ChatInput,
  // run: async (client: Client, interaction: CommandInteraction) => {
  let pages: Embed[] = [];
  const splitsize = Math.max(4, Math.ceil(summaries.length / 25));
  // var splitSums = {}
  let splicedArrs: [SummarizeResult[]] = [[]];
  summaries.forEach((summary, i) => {
    if (i % splitsize === 0 && i !== 0) splicedArrs.push([]);
    splicedArrs[splicedArrs.length - 1].push(summary);
  });
  splicedArrs.forEach((element) => {
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Your Tal;dera Summary')
      .setURL('https://github.com/pyInvenio/tldr-this')
      .setAuthor({
        name: 'Tal;dera',
        iconURL:
          'https://www.howtogeek.com/wp-content/uploads/2019/08/the-word-tldr-in-big-yellow-letters-against-a-black-background.jpeg?height=200p&trim=2,2,2,2',
      })
      .setTimestamp();

    element.forEach((summary) => {
      exampleEmbed.addFields({
        name: `${summary.start
        } - ${
          summary.end
        }`,
        value: '['.concat(
          summary.content,
          '](',
          summary.start_message_url,
          ')'
        ),
        inline: false,
      });
    });
    pages.push(exampleEmbed as any);
  });

  // await interaction.followUp({
  //   ephemeral: true,
  //   embeds: [exampleEmbed],
  // }).then(

  // );
  await pagination({
    embeds: pages, // Array of embeds objects
    author: interaction.member?.user as User,
    interaction: interaction,
    ephemeral: true,
    time: 120000 + pages.length * 3000, // 120 seconds
    disableButtons: true, // Remove buttons after timeout
    fastSkip: false,
    pageTravel: false,

    buttons: [
      {
        value: TypesButtons.previous,
        label: 'Previous Page',
        style: StylesButton.Primary,
      },
      {
        value: TypesButtons.next,
        label: 'Next Page',
        style: StylesButton.Success,
      },
    ],
  });
  // },
}
