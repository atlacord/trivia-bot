import { InteractionType } from 'discord.js';
import { EventManager } from '../managers/EventManager';

export default async function interactionCreate(manager: EventManager, interaction: any) {
    switch (interaction.type) {
        case InteractionType.ApplicationCommand: {
            const command = manager.bot.commands!.get(interaction.commandName);

            if (!command) {
                return manager.bot.logger.error(`[interactionCreate] No command found, ignoring interaction`)
            }

            try {
                await command.execute({ interaction: interaction, context: { name: interaction.commandName, id: interaction.commandId} });
            } catch (err: any) {
                manager.bot.logger.error(`[interactionCreate] An error occurred while running ${interaction.commandName}: ${err.stack}`)
            };
        }
        case InteractionType.ApplicationCommandAutocomplete: {
            const command = manager.bot.commands!.get(interaction.commandName);

            if (!command) {
                return manager.bot.logger.error(`[interactionCreate] Autocomplete not found for command, ignoring interaction`)
            };

            try {
                if (command.autocomplete) {
                    await command.autocomplete(interaction);
                }
            } catch (err) {
                manager.bot.logger.error(err);
            }
        }
    }
};