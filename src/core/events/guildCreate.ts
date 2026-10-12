import { Guild } from 'discord.js';
import { EventManager } from '../managers/EventManager';

export default async function guildCreate(manager: EventManager, guild: Guild) {
    return manager.bot.logger.info(`[guildCreate] Joined new guild ${guild.name} (${guild.id})`);
};