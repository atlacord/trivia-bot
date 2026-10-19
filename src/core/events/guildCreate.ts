import { Guild } from 'discord.js';
import { EventManager } from '../managers/EventManager';

export default async function guildCreate(manager: EventManager, guild: Guild) {
    let owner = await manager.bot.client.users.fetch(guild.ownerId);
    let embed = {
        color: 0x66ff6b,
        author: {
            name: 'Guild Create'
        },
        thumbnail: {
            url: guild.iconURL()
        },
        description: guild.description || null,
        fields: [
            { name: 'Name', value: guild.name },
            { name: 'Owner', value: `${owner.username} (${owner.id})` },
            { name: 'Members', value: guild.memberCount }
        ],
        footer: {
            text: `ID: ${guild.id}`,
            timestamp: new Date()
        }
    }
    manager.bot.webhooks.execute(manager.bot.webhooks.log, embed);
    return manager.bot.logger.info(`[guildCreate] Joined new guild ${guild.name} (${guild.id})`);
};