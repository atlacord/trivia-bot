import { EventManager } from '../managers/EventManager';

export default async function shardReconnecting (manager: EventManager, id: number) {
    let embed = {
        title: 'Shard Reconnecting',
        fields: [
            { name: 'ID', value: id },
        ],
        timestamp: new Date()
    }
    manager.webhooks.execute(manager.webhooks.channels.client, { embeds: [embed] });
    return manager.bot.logger.debug(`[ShardManager] Shard ${id} reconnecting`);
};