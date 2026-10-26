import { Guild } from 'discord.js';
import { EventManager } from '../managers/EventManager';

export default async function guildCreate(manager: EventManager, guild: Guild) {
    let owner = await manager.bot.client.users.fetch(guild.ownerId);
    let embed = {
        color: 0x66ff6b,
        title: 'Guild Create',
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
    manager.webhooks.execute(manager.webhooks.channels.guild, { embeds: [embed] });
    return manager.bot.logger.info(`[guildCreate] Joined new guild ${guild.name} (${guild.id})`);
};