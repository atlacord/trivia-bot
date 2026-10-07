import { ChatInputCommandInteraction, MessageFlags, ContainerComponent, InteractionReplyOptions, MessageComponent, User } from 'discord.js';
import crypto from 'crypto';
import DiscordClient from '../../core/Bot';

interface Question {
    question: string;
    answers: string[];
};

interface Session {
    id: string;
    user: User
    list: Question[];
    currentQuestion?: Question;
    questionNumber: number;
    score: number;
    timeLimit: number;
    maxScore: number;
    maxQuestions: number;
};

interface SessionOptions {
    id: string;
    user: User | any;
    list: Question[];
    timeLimit?: number;
    maxScore?: number;
    maxQuestions?: number;
};

export default class TriviaSession {
    public bot: DiscordClient
    private interaction: ChatInputCommandInteraction;
    private session: Session;
    private reply: Map<string, any>;
    private playing: boolean;

    constructor(bot: DiscordClient, interaction: ChatInputCommandInteraction, options: SessionOptions) {
        this.bot = bot;
        this.interaction = interaction;
        this.session = this.createSession(options);
        this.reply = new Map();
        this.playing = true;
        this.runTrivia();
        console.debug(this.session);
    };

    public createSession(options: SessionOptions): Session {
        console.debug(`[TriviaSession] Initializing new session ${options.id} in ${this.interaction.guildId}`);
        return {
            id: options.id,
            user: options.user,
            list: options.list,
            questionNumber: 0,
            score: 0,
            timeLimit: options.timeLimit || 15000,
            maxScore: options.maxScore || 10000,
            maxQuestions: options.maxQuestions || 10
        }
    };

    public async sendMessage(options: any, components?: MessageComponent[]) {
        let c;
        if (components) {
            c = components;
        } else {
            c = {
                type: 17,
                accent_color: options.color,
                components: [
                    {
                        type: 10,
                        content: `## ${options.heading}`
                    },
                    {
                        type: 14,
                        divider: true,
                        spacing: 1
                    },
                    {
                        type: 10,
                        content: `${options.content}`
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 3,
                                custom_id: `${this.session.id}:score:button`,
                                label: `Score: ${this.session.score}`,
                                disabled: true,
                            }
                        ]
                    }
                ]
            }
        };
        let payload: any = {
            flags: MessageFlags.IsComponentsV2,
            components: [c]
        };

        let reply;
        if (this.reply.has(`${this.session.id}:reply`)) {
            reply = this.reply.get(`${this.session.id}:reply`);
            reply = reply.edit(payload);
        } else {
            reply = await this.interaction.reply(payload);
            this.reply.set(`${this.session.id}:reply`, reply);
        };
        return reply;
    };

    public checkAnswer(answer: string): boolean {
        for (let a of this.session.currentQuestion!.answers) {
            if (answer.toLowerCase() === a.toLowerCase()) {
                return true;
            };
        };
        return false;
    }

    public endGame(): boolean {
        console.debug(`[TriviaSession] Closing session ${this.session.id}`)
        this.playing = false;
        return false;
    };

    public newQuestion(): Question {
        const selected = crypto.randomInt(0, this.session.list.length);
        const question = this.session.list[selected];
        this.session.list.splice(selected, 1);
        return question;
    };

    public async runTrivia() {
        while (this.playing) {
            // End game if user exceeds the maximum score or questions
            if ((this.session.maxScore && (this.session.score >= this.session.maxScore) || this.session.questionNumber > this.session.maxQuestions)) {
                await this.sendMessage({ color: 0xff4040, heading: 'Game Over', content: 'We\'re out of questions! Thanks for playing!'});
                this.endGame();
                break;
            };

            this.session.currentQuestion = this.newQuestion();
            this.session.questionNumber = this.session.questionNumber! += 1;

            let revealMessages = [
                `I know this one! ${this.session.currentQuestion.answers[0]}`,
                `Easy: ${this.session.currentQuestion.answers[0]}.`,
                `Oh really? It's ${this.session.currentQuestion.answers[0]} of course.`
            ];

            let failMessages = [
                'To the next one, I guess...',
                'Moving on....',
                'I\'m sure you\'ll know the answer to the next one.',
                'Next one.'
            ];

            let container: any = {
                type: 17,
                accent_color: 0xffe4a8,
                components: [
                    // Header
                    {
                        type: 10,
                        content: `## Question ${this.session.questionNumber}`
                    },
                    //Question content
                    {
                        type: 10,
                        content: `### ${this.session.currentQuestion!.question}`
                    },
                    // Separator
                    {
                        type: 14,
                        divider: true,
                        spacing: 1
                    },
                    // Button row for answer submission
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                custom_id: `${this.session.id}:submit:button`,
                                label: 'Click here to submit your answer',
                                style: 1
                            },
                            {
                                type: 2,
                                style: 3,
                                custom_id: `${this.session.id}:question:score:button`,
                                label: `Score: ${this.session.score}`,
                                disabled: true,
                            }
                        ]
                    }
                ]
            };

            let quizMessage = await this.sendMessage({}, container);

            try {
                let buttonInteraction = await quizMessage.awaitMessageComponent({
                    filter: (interaction: any) => (interaction.customId === `${this.session.id}:submit:button`) && (interaction.user.id === this.session.user.id),
                    time: this.session.timeLimit
                });
                
                const modal = {
                    custom_id: `${this.session.id}:modal`,
                    title: 'Submit Answer',
                    components: [
                        {
                            type: 18,
                            label: `Question ${this.session.questionNumber} - ${this.session.currentQuestion.question}`,
                            description: 'Enter your answer here',
                            component: {
                                type: 4,
                                custom_id: 'answer',
                                style: 2,
                                min_length: 2,
                                max_length: 4000,
                                placeholder: 'A very interesting question response.',
                                required: true
                            }
                        }
                    ]
                };

                if (modal.components[0].label.length > 45) {
                    modal.components[0].label = `Question ${this.session.questionNumber}`;
                };

                await buttonInteraction.showModal(modal);

                let modalInteraction = await buttonInteraction.awaitModalSubmit({
                    filter: (interaction: any) => (interaction.customId === modal.custom_id) && (interaction.user.id === this.session.user.id),
                    time: this.session.timeLimit
                });

                const answer = await modalInteraction.fields.getTextInputValue('answer').trim().toLowerCase();
                if (this.checkAnswer(answer)) {
                    modalInteraction.deferUpdate();
                    this.session.score += 1000;
                    await this.sendMessage({ color: 0x66ff6b, heading: 'Correct!', content: `You got it ${this.interaction.user.username}! **+1** to you.`});
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    modalInteraction.deferUpdate();
                    await this.sendMessage({ color: 0xff4040, heading: 'Incorrect', content: `The correct answer is **${this.session.currentQuestion.answers[0]}**. ${failMessages[Math.floor(crypto.randomInt(0, failMessages.length))]}` });
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch {
                await this.sendMessage({ color: 0xff4040, heading: 'Time\'s up!', content: `The correct answer was **${this.session.currentQuestion!.answers[0]}**. Moving on...`});
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}