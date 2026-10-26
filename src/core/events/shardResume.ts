import { EventManager } from '../managers/EventManager';

export default async function shardResume(manager: EventManager, id: number, replayedEvents: number) {
    let embed = {
        title: 'Shard Ready',
        fields: [
            { name: 'ID', value: id },
            { name: 'Replayed Events', value: replayedEvents }
        ],
        timestamp: new Date()
    }
    manager.webhooks.execute(manager.webhooks.channels.client, { embeds: [embed] });
    return manager.bot.logger.debug(`[ShardManager] Shard ${id} ready, ${replayedEvents} events replayed`);
};