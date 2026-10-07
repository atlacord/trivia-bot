import { Guild } from 'discord.js';

export default async function guildCreate(guild: Guild) {
    return console.info(`[guildCreate] Joined new guild ${guild.name} (${guild.id})`);
};