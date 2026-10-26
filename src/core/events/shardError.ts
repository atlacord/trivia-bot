import { EventManager } from '../managers/EventManager';

export default async function shardError(manager: EventManager, error: Error, shardId: number) {
    let embed = {
        title: 'Shard Error',
        description: error.message,
        fields: [
            { name: 'ID', value: shardId },
        ],
        timestamp: new Date()
    }
    manager.webhooks.execute(manager.webhooks.channels.client, { embeds: [embed] });
    return manager.bot.logger.warn(`[ShardManager] Shard ${shardId} error: ${error.message}`);
};