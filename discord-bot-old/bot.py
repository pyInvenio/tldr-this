# This example requires the 'message_content' intent.

from dotenv import load_dotenv
import os

load_dotenv()

class Config(object):
    API_KEY = os.getenv("API_KEY")
    SERVER_ID = os.getenv("SERVER_ID")
config = Config()

import discord
import discord.ext

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

tree = discord.app_commands.CommandTree(client)

synced = False

@client.event
async def on_ready():
    await client.wait_until_ready()
    if not synced:
        await tree.sync(guild=discord.Object(id=config.SERVER_ID))
    print(f'We have logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith('$hello'):
        await message.channel.send('Hello!')

@tree.command(name="hello", description="Say Hello!", guild=discord.Object(id=config.SERVER_ID))
async def hello(int: discord.Interaction):
    await int.response.send_message(f"Hello {int.user.name}!")

@tree.command(name="add", description="Add two numbers!", guild=discord.Object(id=config.SERVER_ID))
async def add(int: discord.Interaction, x: int, y: int):
    await int.response.send_message(f"The answer is {x + y}!" if (x != 1 or y != 1) else "LOL DUMBASS!!!")

@tree.command(name="summarize", description="TL:DR", guild=discord.Object(id=config.SERVER_ID))
async def summarize(int: discord.Interaction, length: int):
    sum = ''
    async for message in int.channel.history(limit=min(length,200)):
        sum += message.author + message.content
    await int.response.send_message(sum)

@tree.command(name="images", description="See thumbnails of images (test function)", guild=discord.Object(id=config.SERVER_ID))
async def images(int: discord.Interaction, length: int):
    # Format metadata   
    pass  

messageDict = {
    "Topics" : ["Persona", "Danganronpa", "Cohere sucks lol"],
    "Summaries": {"0-200": "Mr. Smith's getting a check-up, and Doctor Hawkins advises him to have one every year. Hawkins'll give some information about their classes and medications to help Mr. Smith quit smoking.",
                  "201-400":"Malik invites Nikki to dance. Nikki agrees if Malik doesn't mind getting his feet stepped on.",
                  "401-600":"#Person1#'s angry because #Person2# didn't tell #Person1# that #Person2# had a girlfriend and would marry her.",
                  "601-800": "#Person1#'s looking for a set of keys and asks for #Person2#'s help to find them.",
                  "801-1000":"Mrs Parker takes Ricky for his vaccines. Dr. Peters checks the record and then gives Ricky a vaccine."}
}

@tree.command(name="textout", description="testing method for text output", guild=discord.Object(id=config.SERVER_ID))
async def textout(int: discord.Interaction):
    embed = discord.Embed(
        title="Your Taldera Summary",
        url="https://www.fbi.gov/investigate/terrorism/tsc",
        color=discord.Color.teal())
    embed.set_author(name="Taldera", icon_url="https://www.howtogeek.com/wp-content/uploads/2019/08/the-word-tldr-in-big-yellow-letters-against-a-black-background.jpeg?height=200p&trim=2,2,2,2")
    for i in range()
    
    
    pass


client.run(config.API_KEY)
