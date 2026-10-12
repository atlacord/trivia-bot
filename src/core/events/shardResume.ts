import { EventManager } from '../managers/EventManager';

export default async function shardResume(manager: EventManager, id: number, replayedEvents: number) {
    return manager.bot.logger.debug(`[ShardManager] Shard ${id} ready, ${replayedEvents} events replayed`);
};