import { Guild } from 'discord.js';
import { EventManager } from '../managers/EventManager';

export default async function guildDelete(manager: EventManager, guild: Guild) {
    return manager.bot.logger.info(`[guildDelete] Removed from guild ${guild.name} (${guild.id})`);
};