import { ApplicationCommand, Collection, PermissionFlagsBits, Routes } from 'discord.js';
import fs from 'fs/promises'
import path from 'path';
import type DiscordClient from '../Bot';

export class CommandCollection<K, V> extends Collection<K, V> {
    private bot: DiscordClient;
    private slashCommands: ApplicationCommand[];

    constructor(config: any, bot: DiscordClient) {
        super();
        this.bot = bot;
        this.slashCommands = [];

        this.loadModules();
    };

    /**
     * Loads the module directory
     */
    async loadModules() {
        const basePath = path.resolve(path.join(__dirname, '../../'))
        const folderPath = path.join(basePath, 'modules');
        const folders = await fs.readdir(folderPath);

        try {
            for (const file of folders) {
                console.debug(`[CommandCollection] Loading module ${file}`);
                const commandPath = path.join(folderPath, file);
                this.loadCommands(commandPath);
            }
        } catch (err) {
            console.error(err);
        };
    };

    /**
     * Reads the command directory and imports all valid command files
     * @param commands A directory of command files
     */
    async loadCommands(commandPath: any) {
        let commands = await fs.readdir(commandPath);
        try {
            for (const file of commands) {
                const command = await import(path.join(commandPath, file));
                if (command.default) {
                    // Set a new item in the Collection with the key as the command name and the value as the exported module
                    this.register(command.default);
                };
            }
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Adds a command to the Command collection and adds it to the queue to be registered as a slash command.
     * @param command A command file
     */
    register(Command: any) {
        // Ignore any files that aren't valid commands
        if (Object.getPrototypeOf(Command).name !== 'Command') {
            return console.debug(`[CommandCollection] Skipping unknown command`)
        }
        
        // Instantiate the command
        let command = new Command(this.bot);
        console.debug(`[CommandCollection] Registering command ${command.name}`);
        
        this.set(command.name, command); // Add to the command collection
        this.slashCommands.push(command.slashMetadata()); // Push command metadata to be registered as a slash command
    }

    /**
     * Registers slash commands with Discord
     * @param commands An array of commands' metadata formatted as JSON objects
     */
    async refreshSlashCommands(commands?: ApplicationCommand[]) {
        if (!commands) {
            commands = this.slashCommands;
        }
        try {
            // Register all of the commands with Discord at once
            const data: any = await this.bot.restClient.put(Routes.applicationCommands(this.bot.client.user!.id), { body: commands });
            console.debug(`[CommandCollection] Successfully loaded ${data.length} application commands.`)
        } catch (err) {
            console.error(err);
        }
    }
}