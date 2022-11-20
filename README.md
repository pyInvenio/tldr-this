# Tal;dera - Cohere Thanksgiving Hackathon
*A summarizer bot for missed activity in Discord channels*
Team CloseAI Deceptacons

## Problem
Messenger apps like Discord & Slack have "channels" where multiple parties can send hundreds of text daily.
This can get out of hand pretty quickly if you've been offline, and we've sometimes have to scroll through hundreds of messages to understand what we've missed. The issue is that there isn't a quick & accessible way to figure things out.

## Solution
Tal;dera is a Discord bot which provides an easy-to-read, semantically rich summary of a channel's Discord activity in a particular time range. The summary is split into parts, and each part has a timestamp/link to its original messages.

## Behind the hood
- User sends a command to our bot, which is controlled via the DiscordJS API
- Bot scans channel, does ETL to extract message history, reformats for a language model, and converts history into chunks
- Language model = pretrained endpoint from Cohere API + our own finetuning with the SAMSum dataset (thousands of messenger-like conversations with summaries provided)
- For each chunk of message history, input it into the language model to receive summarized text.
- Multiple techniques to prettify summarized text (embedded output, pagination, timestamps, linked messages). Send output to user.

## Business plan
- B2B for companies which provide messaging services (Discord, Slack, Meta, Microsoft, etc.)
- B2C for owners of Discord servers
- Go-to-market strategy: pilot with smaller Discord servers to receive feedback quickly, rapidly iterate with feedback to scale
- Operating cost: maintaining server
- Revenue model: licensing for B2B, freemium model for B2C

## Next steps
- Multiple limitations, e.g. more human dialogue, edge cases like slang, multi-agent forum datasets like ForumSum which are currently closed source
- Additional features such as support for extracting semantic info from image embeddings, modelling key topics, creating richer graphics for summarization, and support for Discord VCs / video links.
- Customer discovery/validation to figure out best part of the value chain & best beachhead
- Ultimate vision: a general purpose summarization tool which can be used for any messaging service, not just Discord