//fowami bot

const { ActivityHandler, MessageFactory,CardFactory  } = require('botbuilder');

const aboutyourself = require('./resources/aboutyourself.json');

//import aboutyourself from './aboutyourself.json';

const CARDS =[aboutyourself,aboutyourself];

const WELCOME_TEXT = 'Hello?To learn more about Clinics say ok';

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(`Welcome to Our Hospital ${ membersAdded[cnt].name }. ${ WELCOME_TEXT }`);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMessage(async (context, next) => {
            const randomlySelectedCard = CARDS[Math.floor((Math.random() * CARDS.length - 1) + 1)];
            await context.sendActivity({
                text: 'Fill in details Please:',
                attachments: [CardFactory.adaptiveCard(randomlySelectedCard)]
            });

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
