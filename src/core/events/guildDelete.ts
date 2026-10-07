import { Guild } from 'discord.js';

export default async function guildDelete(guild: Guild) {
    return console.info(`[guildDelete] Removed from guild ${guild.name} (${guild.id})`);
};