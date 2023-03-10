const { response } = require('express');
const admin = require('firebase-admin');
const { USER_BOT_RESPONSES, FACTCHECKER_BOT_RESPONSES } = require('./constants');
const { sleep } = require('./utils');
const { sendTextMessage } = require('./sendMessage')
const { sendWhatsappButtonMessage } = require('./sendWhatsappMessage')

async function respondToInstance(instanceSnap) {
  const parentMessageRef = instanceSnap.ref.parent.parent;
  const parentMessageSnap = await parentMessageRef.get();
  const data = instanceSnap.data();
  if (!data.from) {
    functions.logger.log("Missing 'from' field in instance data");
    return Promise.resolve()
  }
  const responses = await getResponsesObj(botType = "user");
  const isAssessed = parentMessageSnap.get("isAssessed");
  const isIrrelevant = parentMessageSnap.get("isIrrelevant");
  const isScam = parentMessageSnap.get("isScam");
  const isIllicit = parentMessageSnap.get("isIllicit");
  const truthScore = parentMessageSnap.get("truthScore");

  if (!isAssessed) {
    await sendTextMessage("user", data.from, responses.MESSAGE_NOT_YET_ASSESSED, data.id)
    return;
  }
  if (isScam || isIllicit) {
    let responseText;
    if (isScam) {
      responseText = responses.SCAM;
    } else {
      responseText = responses.SUSPICIOUS;
    }
    res = await sendTextMessage("user", data.from, responseText, data.id)
    await sleep(2000);
    await sendTextMessage("user", data.from, responses.SCAMSHIELD_PREAMBLE, null, "whatsapp", true)
    const buttons = [{
      type: "reply",
      reply: {
        id: `scamshieldConsent_${instanceSnap.ref.path}_consent`,
        title: "Yes",
      },
    }, {
      type: "reply",
      reply: {
        id: `scamshieldConsent_${instanceSnap.ref.path}_decline`,
        title: "No",
      }
    }];
    await sleep(2000);
    await sendWhatsappButtonMessage("user", data.from, responses.SCAMSHIELD_SEEK_CONSENT, buttons, data.id)
    return;
  }
  if (isIrrelevant) {
    await sendTextMessage("user", data.from, responses.IRRELEVANT, data.id)
    return;
  }
  if (truthScore === null) {
    await sendTextMessage("user", data.from, responses.NO_SCORE, data.id)
    return;
  }
  sendTextMessage("user", data.from, _getResponse(truthScore, responses), data.id)
  return;
}

function getResponseToMessage(docSnap, responses) {
  const isAssessed = docSnap.get("isAssessed");
  const isIrrelevant = docSnap.get("isIrrelevant");
  const isScam = docSnap.get("isScam");
  const truthScore = docSnap.get("truthScore");

  if (!isAssessed) {
    return responses.MESSAGE_NOT_YET_ASSESSED
  }
  if (isScam) {
    return responses.SCAM;
  }
  if (isIrrelevant) {
    return responses.IRRELEVANT;
  }
  if (truthScore === null) {
    return responses.NO_SCORE;
  }
  return _getResponse(truthScore, responses);
};

async function getResponsesObj(botType = "user") {
  const db = admin.firestore()
  let path;
  let fallbackResponses;
  if (botType === "user") {
    path = 'systemParameters/userBotResponses';
    fallbackResponses = USER_BOT_RESPONSES;
  } else if (botType === "factChecker") {
    path = 'systemParameters/factCheckerBotResponses'
    fallbackResponses = FACTCHECKER_BOT_RESPONSES;
  }
  const defaultResponsesRef = db.doc(path);
  const defaultResponsesSnap = await defaultResponsesRef.get()
  return defaultResponsesSnap.data() ?? fallbackResponses
};

function _getResponse(key, responses) {
  if (isNaN(key)) { //means key is a string
    return responses.key;
  } else {
    const truthScore = key;
    let numericKeys = Object.keys(responses).filter((e) => !isNaN(e)).sort();
    for (let numericKey of numericKeys) {
      if (parseFloat(numericKey) >= truthScore) {
        return responses[`${numericKey}`];
      }
    }
  }
  return null;
};

exports.getResponsesObj = getResponsesObj;
exports.getResponseToMessage = getResponseToMessage;
exports.respondToInstance = respondToInstance;