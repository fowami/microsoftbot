/**
 * A simple bot for booking clinic
 * Assignment
 * Author Fowami K
 */
const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class BookingDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'bookingDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.toStep.bind(this),
                this.fromStep.bind(this),
                this.bookingDateStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async toStep(stepContext) {
        const bookingDetails = stepContext.options;

        if (!bookingDetails.towhatTime) {
            const messageText = 'At what time would want to arrive?';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.towhatTime);
    }

    /**
     * If time has not been provided, prompt for one.
     */
    async fromStep(stepContext) {
        const bookingDetails = stepContext.options;

        bookingDetails.towhatTime = stepContext.result; //previous captured time
        if (!bookingDetails.fromWhatTime) {
            const messageText = 'To what time?';
            const msg = MessageFactory.text(messageText, 'From what time?', InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.fromWhatTime);
    }

    /**
     * If a Booking date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    async bookingDateStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the results of the previous step
        bookingDetails.fromWhatTime = stepContext.result;
        if (!bookingDetails.bookingDate || this.isAmbiguous(bookingDetails.bookingDate)) {
            return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { date: bookingDetails.bookingDate });
        }
        return await stepContext.next(bookingDetails.bookingDate);
    }
    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the results of the previous step
        bookingDetails.bookingDate = stepContext.result;
        const messageText = `Please confirm, You will be scheduled for a clinic between: ${ bookingDetails.towhatTime} To: ${ bookingDetails.fromWhatTime } on: ${ bookingDetails.bookingDate}. Is this ok with you?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        if (stepContext.result === true) {
            const bookingDetails = stepContext.options;
            return await stepContext.endDialog(bookingDetails);
        }
        return await stepContext.endDialog();
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}

module.exports.BookingDialog = BookingDialog;
