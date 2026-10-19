import { EventManager } from '../managers/EventManager';

export default async function shardReconnecting (manager: EventManager, id: number) {
    let embed = {
        author: {
            name: 'Shard Reconnecting'
        },
        fields: [
            { name: 'ID', value: id },
        ],
        timestamp: new Date()
    }
    manager.bot.webhooks.execute(manager.bot.webhooks.channels.client, { embeds: [embed] });
    return manager.bot.logger.debug(`[ShardManager] Shard ${id} reconnecting`);
};