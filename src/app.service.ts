import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';

@Injectable()
export class AppService implements OnModuleInit {
  private client: Client;

  async onModuleInit() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.on('ready', () => {
      console.log(`Bot logado como ${this.client.user?.tag}`);
    });

    this.client.on('messageCreate', async (msg) => {
      if (msg.author.bot) return;

      const botUser = this.client.user;
      if (!botUser) return;

      const mentioned = msg.mentions.has(botUser);
      if (!mentioned) return;

      const userId = botUser.id;

      const text = msg.content
        .replace(`<@${userId}>`, '')
        .replace(`<@!${userId}>`, '')
        .trim();

      const payload = {
        question: text,
        channelId: msg.channel.id,
        userId: msg.author.id,
        username: msg.author.username,
      };

      try {
        await axios.post(process.env.N8N_WEBHOOK_URL!, payload);
      } catch (e) {
        console.log('Erro ao enviar para webhook:', e.message);
      }
    });

    await this.client.login(process.env.DISCORD_TOKEN!);
  }

  getStatus() {
    return 'Bot rodando';
  }
}
