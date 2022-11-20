import { Command } from './interfaces/Command';
import { Hello } from './commands/Hello';
import { TextEmbed } from './commands/TextEmbed';
import { Summarize } from './commands/Summarize';
export const Commands: Command[] = [Hello, Summarize, TextEmbed];
