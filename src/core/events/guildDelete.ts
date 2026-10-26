import { Guild } from 'discord.js';
import { EventManager } from '../managers/EventManager';

export default async function guildDelete(manager: EventManager, guild: Guild) {
    let owner = await manager.bot.client.users.fetch(guild.ownerId);
    let embed = {
        color: 0xff4040,
        title: 'Guild Delete',
        thumbnail: {
            url: guild.iconURL()
        },
        description: guild.description || null,
        fields: [
            { name: 'Name', value: guild.name },
            { name: 'Owner', value: `${owner.username} (${owner.id})` },
            { name: 'Members', value: guild.memberCount },
            { name: 'Total Guilds', value: manager.client.guilds.cache.size }
        ],
        footer: {
            text: `ID: ${guild.id}`,
        },
        timestamp: new Date()
    }
    manager.webhooks.execute(manager.webhooks.channels.client, { embeds: [embed] });
    return manager.bot.logger.info(`[guildDelete] Removed from guild ${guild.name} (${guild.id})`);
};