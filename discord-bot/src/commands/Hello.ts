import { ApplicationCommandType, Client, CommandInteraction } from 'discord.js';
import { Command } from '../interfaces/Command';

export const Hello: Command = {
  name: 'hello',
  description: 'Returns a greeting',
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    const resp = "Hello " + interaction.user + "!";

    await interaction.followUp({
      content: resp,
      ephemeral: true
    });
    
    // const content = `Hello ${interaction.user}!`;

    // await interaction.followUp({
    //   ephemeral: true,
    //   content,
    // });
  },
};
