/**
 * A simple bot for booking clinic
 * Assignment
 * Author Fowami K
 */
const { LuisRecognizer } = require('botbuilder-ai');

class BookingRecognizer {
    constructor(config) {
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        if (luisIsConfigured) {
            const recognizerOptions = {
                apiVersion: 'v3'
            };

            this.recognizer = new LuisRecognizer(config, recognizerOptions);
        }
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeLuisQuery(context) {
        return await this.recognizer.recognize(context);
    }

    getFromEntities(result) {
        let fromValue, clinicTime;
        if (result.entities.$instance.From) {
            fromValue = result.entities.$instance.From[0].text;
        }
        if (fromValue && result.entities.From[0].CTime) {
            clinicTime = result.entities.From[0].CTime[0][0];
        }

        return { from: fromValue, ctime: clinicTime };
    }

    getToEntities(result) {
        let toValue, toClinicTime;
        if (result.entities.$instance.To) {
            toValue = result.entities.$instance.To[0].text;
        }
        if (toValue && result.entities.To[0].CTime) {
            toClinicTime = result.entities.To[0].CTime[0][0];
        }

        return { to: toValue,ctime: toClinicTime };
    }

    /**
     * This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
     * TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
     */
    getClinicDate(result) {
        const datetimeEntity = result.entities.datetime;
        if (!datetimeEntity || !datetimeEntity[0]) return undefined;

        const timex = datetimeEntity[0].timex;
        if (!timex || !timex[0]) return undefined;

        const datetime = timex[0].split('T')[0];
        return datetime;
    }
}

module.exports.BookingRecognizer = BookingRecognizer;
