import { Message, User } from 'discord.js';
import Constants from '../Constants';
import cohere from 'cohere-ai';
import { SummarizeResult } from 'src/interfaces/Summarize';

export default async (
  messages: Message[],
  bot_message: Message,
  chunk_size: number
): Promise<SummarizeResult[]> => {
  cohere.init(process.env.COHERE_API || '');

  const users: Record<string, User> = {};
  const user_to_id: Record<string, number> = {};
  const id_to_user: Record<number, string> = {};

  let curr = 0;
  let to_summarize = Math.min(
    chunk_size,
    messages.length
  );

  const ret: SummarizeResult[] = [];

  bot_message.edit(
    `Summarized ${curr} out of ${messages.length}...\n` +
      getProgressBar(curr, messages.length, 50)
  );

  while (curr < messages.length) {
    if (to_summarize <= 0) curr += 1;

    const processed_message = messages
      .slice(curr, curr + to_summarize)
      .map((message) => {
        if (!users[message.author.id]) {
          users[message.author.id] = message.author;
          user_to_id[message.author.id] = Object.keys(id_to_user).length;
          id_to_user[user_to_id[message.author.id]] = message.author.id;
        }
        const index = user_to_id[message.author.id];
        return `${
          Constants.Summarizer.USER_PREFIX_TOKEN
        }${index}: ${message.content
          .replace(/([\s]|[^\d\w.!?'":;,/\\])+/, ' ')
          .replace(/(((https?:\/\/)|(www\.))[^\s]+)/gi, '')}`; // link culling
      })
      .join(' ');

    // .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')}`;
    //Test message
    const prompt = `This program takes in a Dialogue segment and outputs a Summary of the conversation:\n\nDialogue: Person1: Hi, Mr. Smith. I'm Doctor Hawkins. Why are you here today? Person2: I found it would be a good idea to get a check-up.  Person1: Yes, well, you haven't had one for 5 years. You should have one every year. Person2: I know. I figure as long as there is nothing wrong, why go see the doctor? Person1: Well, the best way to avoid serious illnesses is to find out about them early. So try to come at least once a year for your own good. Person2: Ok. Person1: Let me see here. Your eyes and ears look fine. Take a deep breath, please. Do you smoke, Mr. Smith? Person2: Yes. Person1: Smoking is the leading cause of lung cancer and heart disease, you know. You really should quit. Person2: I've tried hundreds of times, but I just can't seem to kick the habit. Person1: Well, we have classes and some medications that might help. I'll give you more information before you leave. Person2: Ok, thanks doctor.\nSummary: Mr. Smith's getting a check-up, and Doctor Hawkins advises him to have one every year. Hawkins'll give some information about their classes and medications to help Mr. Smith quit smoking.\n----\nDialogue: Person1: Hello Mrs. Parker, how have you been? Person2: Hello Dr. Peters. Just fine thank you. Ricky and I are here for his vaccines. Person1: Very well. Let's see, according to his vaccination record, Ricky has received his Polio, Tetanus and Hepatitis B shots. He is 14 months old, so he is due for Hepatitis A, Chickenpox and Measles shots. Person2: What about Rubella and Mumps? Person1: Well, I can only give him these for now, and after a couple of weeks I can administer the rest. Person2: OK, great. Doctor, I think I also may need a Tetanus booster. Last time I got it was maybe fifteen years ago! Person1: We will check our records and I'll have the nurse administer and the booster as well. Now, please hold Ricky's arm tight, this may sting a little.\nSummary: Mrs Parker takes Ricky for his vaccines. Dr. Peters checks the record and then gives Ricky a vaccine.\n----\nDialogue: Person1: This is a good basic computer package. It's got a good CPU, 256 megabytes of RAM, and a DVD player. Person2: Does it come with a modem? Person1: Yes, it has a built-in modem. You just plug a phone line into the back of the computer. Person1: How about the monitor? Person1: A 15 - inch monitor is included in the deal. If you want, you can switch it for a 17 - inch monitor, for a little more money. Person2: That's okay. A 15 - inch is good enough. All right, I'll take it.\nSummary: Person1 shows a basic computer package to Person2. Person2 thinks it's good and will take it.\n----\nDialogue: ${processed_message}\nSummary:`;

    console.log('Prompt: ', processed_message);

    const response = await cohere.generate({
      model: '1286cd9e-4427-4211-8ae4-89f98aeb51ba-ft',
      prompt,
      max_tokens: 50,
      temperature: 0.9,
      k: 0,
      p: 0.75,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop_sequences: ['----'],
      return_likelihoods: 'NONE',
    });

    if (response.statusCode !== 200) {
      to_summarize -= 5;
      continue;
    }

    let summary = response.body.generations[0].text;

    console.log('\n\nResult:', summary, '\n');

    summary = summary
      .slice(0, summary.length - 4)
      .split(/\s+/)
      .map((token) => {
        if (
          token.indexOf(Constants.Summarizer.USER_PREFIX_TOKEN) == 0 &&
          users[
            id_to_user[
              parseInt(
                token.slice(Constants.Summarizer.USER_PREFIX_TOKEN.length)
              )
            ]
          ]
        ) {
          return `**${
            users[
              id_to_user[
                parseInt(
                  token.slice(Constants.Summarizer.USER_PREFIX_TOKEN.length)
                )
              ]
            ].username
          }**`;
        }
        return token;
      })
      .join(' ');
    summary = summary.slice(0, summary.lastIndexOf('.') + 1).trim();

    ret.push({
      start: new Date(messages[curr].createdTimestamp).toUTCString(),
      end: new Date(messages[curr + to_summarize - 1].createdTimestamp).toUTCString(),
      content: summary,
      start_message_url: messages[curr].url,
    });

    curr += to_summarize;

    bot_message.edit(
      `Summarized ${curr} out of ${messages.length}...\n` +
        getProgressBar(curr, messages.length, 50)
    );

    to_summarize = Math.min(
      messages.length - curr,
      chunk_size
    );
  }

  return ret;
};

const getProgressBar = (value: number, maxValue: number, size: number) => {
  const percentage = value / maxValue;
  const progressLow = Math.floor(size * percentage);
  const progressHigh = Math.ceil(size * percentage);
  const emptyProgress = size - progressHigh;
  const progressLowText = '█'.repeat(progressLow);
  const progressHighText = '▒'.repeat(progressHigh - progressLow);
  const emptyProgressText = '░'.repeat(emptyProgress);
  const percentageText = Math.round(percentage * 100) + '%';

  const bar =
    '[' +
    progressLowText +
    progressHighText +
    emptyProgressText +
    '] ' + 
    percentageText;
  return bar;
};
