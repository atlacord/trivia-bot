export type CommandArg = GenericCommandArg | ChannelCommandArg | StringCommandArg | NumberCommandArg;

interface CommandArgBase {
    name: string;
    description: string;
    position: number;
    // if defined, goes from position to positionSpanEnd, -1 denotes to end of input
    positionSpanEnd?: number;
    optional: boolean;
    missingArgMessage?: string;
    type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
}; 

interface GenericCommandArg extends CommandArgBase {
    type: 1 | 2 | 5 | 6 | 8 | 9 | 11;
};  

export interface StringCommandArg extends CommandArgBase {
    type: 3;
    autocomplete?: boolean;
    // autocompleteHandler?: (data: AutocompleteInteraction) => Promise<AutocompleteOption<string>[] | null>;
    minLength?: number;
    maxLength?: number;
    // valid pre-determined options for string/number args
    options?: {
        name: string;
        value: string | number;
    }[];
};
  
interface ChannelCommandArg extends CommandArgBase {
    type: 7;
    // used with interaction to specify channel types allowed in an arg
    channelTypes?: number[];
};
  
export interface NumberCommandArg extends CommandArgBase {
    type: 4 | 10;
    // valid pre-determined options for string/number args
    options?: {
      name: string;
      value: string | number;
    }[];
    minValue?: number;
    maxValue?: number;
    autocomplete?: boolean;
    // autocompleteHandler?: (data: AutocompleteInteraction) => Promise<AutocompleteOption<number>[] | null>;
};

export interface CommandContext extends Record<PropertyKey, unknown> {
    name: string;
    id: string;
};