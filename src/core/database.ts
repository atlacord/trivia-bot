import DiscordClient from './Bot';
import mongoose from 'mongoose';
import { readdirSync } from 'fs';
import path from 'path';

const basename = path.basename(module.filename);
const modelPath = path.join(__dirname, 'models');

export class DataStore {
    public dbString: string;
    public _bot: DiscordClient;
    public logger: any;
    public _models: any;

    constructor(bot: DiscordClient, uri: string, options?: any) {
        this.dbString = uri;
        this._bot = bot;
        this._models = {};
        this.logger = bot.logger;
        this.logger.info('[DataStore] Connecting to MongoDB');

        if (!uri) {
            return this.logger.error('[DataStore] Missing or invalid Mongo URI');
        };
        
        mongoose.connect(this.dbString);
        const dbConnection = mongoose.connection;

        dbConnection.on('error', (err) => this.logger.error(`[DataStore] Connection error: ${err.message}`));
		dbConnection.once('open', () => this.logger.info('Connected to mongo.'));

        this.loadModels();
    };

    /**
     * Mongo models
     */
    get models() {
		return this._models;
	};

    /**
     * The DB connection
     */
    get connection() {
        return mongoose.connection;
    };

    /**
     * Read the model directory and register all valid model schemas
     */
    public loadModels() {
        readdirSync(modelPath).filter(f => (f.indexOf('.') !== 0) && (f !== basename) && (f.slice(-3) === '.js'))
        .forEach(f => {
            const model = require(path.join(modelPath, f))
            this.logger.debug(`[DataStore] Loading schema ${model.name}`);
            this.registerModel(model);
        });
        this.logger.info(`[DataStore] Registered ${Object.keys(this._models).length} models`);
    }

    /**
     * 
     * @param {mongoose.Model} model A mongoose model
     */
    public registerModel({name, schema}) {
        const model = mongoose.model(name, schema);
        this.logger.debug(`[DataStore] Registering model ${model.modelName}`);
        this._models[model.modelName] = model;
    }
}