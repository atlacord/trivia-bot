export interface SlashCommandArgumentEnvelope {
	[key: string] : SlashCommandArgumentData | Function;
	convert: Function;
}

export interface SlashCommandArgumentData {
	type: 'user'|'role'|'integer'|'string'|'channel'|'boolean',
	description: string,
	required?: boolean,
}