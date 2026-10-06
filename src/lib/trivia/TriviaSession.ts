import { GuildMember, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import crypto from 'crypto';
import DiscordClient from '../../core/Bot';

interface Question {
    question: string;
    answers: string[];
};

interface Session {
    id: string;
    user: GuildMember
    list: Question[];
    currentQuestion?: Question;
    questionNumber?: number;
    streak: number;
    timeLimit: number;
    maxScore: number;
};

interface SessionOptions {
    id: string;
    user: GuildMember | any;
    list: Question[];
    timeLimit?: number;
    maxScore?: number;
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
    };

    public createSession(options: SessionOptions): Session {
        return {
            id: options.id,
            user: options.user,
            list: options.list,
            questionNumber: 0,
            streak: 0,
            timeLimit: options.timeLimit || 20000,
            maxScore: options.maxScore || 10000
        }
    };

    public async sendMessage(content: any) {
        let reply;
        if (this.reply.has(`${this.session.id}:reply`)) {
            reply = this.reply.get(`${this.session.id}:reply`);
            reply = reply.edit(content);
        } else {
            reply = await this.interaction.reply(content);
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

    public endGame(): void {
        this.playing = false;
    };

    public newQuestion(): Question {
        const selected = crypto.randomInt(0, this.session.list.length);
        const question = this.session.list[selected];
        this.session.list.splice(selected, 1);
        return question;
    };

    public async runTrivia() {
        let score: number = 0;

        let componentId = `trivia:${this.session.id}`;

        while (this.playing) {
            // End game if user's score exceeds the maximum
            if (this.session.maxScore && (score >= this.session.maxScore)) {
                this.endGame();
                return;
            };

            // End game if there are no questions left
            if (this.session.list.length === 0) {
                let container = {
                    type: 17,
                    accent_color: 0xff4040,
                    components: [
                        {
                            type: 10,
                            content: '# Game Over'
                        },
                        {
                            type: 14,
                            divider: true,
                            spacing: 1
                        },
                        {
                            type: 10,
                            content: `We're out of questions! Your final score is: **${score}**`
                        }
                    ]
                }
                await this.sendMessage(container);
                this.endGame();
                return;
            };
            
            this.session.currentQuestion = this.newQuestion();
            this.session.questionNumber = this.session.questionNumber! += 1;

            let container = {
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
                    {
                        type: 10,
                        content: `Current Score: ${score}`
                    },
                    // Button row for answer submission
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                custom_id: `${componentId}:button`,
                                label: 'Click here to submit your answer',
                                style: 1
                            }
                        ]
                    }
                ]
            };

            let quizMessage = await this.sendMessage({ flags: MessageFlags.IsComponentsV2, components: [container]});

            let buttonInteraction = await quizMessage.awaitMessageComponent({
                filter: (interaction: any) => (interaction.customId === `${componentId}:button`) && (interaction.user.id === this.session.user.id),
                time: this.session.timeLimit
            });

            const modal = {
                custom_id: `${componentId}:modal`,
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
                            min_length: 3,
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

            try {
                let modalInteraction = await buttonInteraction.awaitModalSubmit({
                    filter: (interaction: any) => (interaction.customId === modal.custom_id) && (interaction.user.id === this.session.user.id),
                    time: this.session.timeLimit
                });

                const answer = await modalInteraction.fields.getTextInputValue('answer').trim().toLowerCase();
                if (this.checkAnswer(answer)) {
                    modalInteraction.deferUpdate();
                    this.session.streak += 1;
                    score += 1000;

                    container = {
                        type: 17,
                        accent_color: 0x66FF6B,
                        components: [
                            {
                                type: 10,
                                content: '# Correct!'
                            },
                            {
                                type: 14,
                                divider: true,
                                spacing: 1
                            },
                            {
                                type: 10,
                                content: `Your new streak is **${this.session.streak}**. The next question will appear in 5 seconds.`
                            }
                        ]
                    }
                    await this.sendMessage(container);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    modalInteraction.deferUpdate();
                    container = {
                        type: 17,
                        accent_color: 0xFF4040,
                        components: [
                            {
                                type: 10,
                                content: '# Incorrect'
                            },
                            {
                                type: 14,
                                divider: true,
                                spacing: 1
                            },
                            {
                                type: 10,
                                content: `The correct answer is: **${this.session.currentQuestion!.answers[0]}**. Your final score is: **${score}**`
                            }
                        ]
                    }
                    await this.sendMessage(container);
                    this.playing = false;
                }
            } catch (err) {
                container = {
                    type: 17,
                    accent_color: 0xFF4040,
                    components: [
                        {
                            type: 10,
                            content: '# Time\'s up!'
                        },
                        {
                            type: 14,
                            divider: true,
                            spacing: 1
                        },
                        {
                            type: 10,
                            content: `The correct answer was **${this.session.currentQuestion!.answers[0]}**. Your final score is **${score}**.`
                        }
                    ]
                }
                this.sendMessage(container);
                this.endGame();
            }
        }
    }
}