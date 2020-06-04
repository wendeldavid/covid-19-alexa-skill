/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const languageStrings = require('./languageStrings');
var https = require('https');

const STATES = {
  "brasil" : "BR",
  "acre": "AC",
  "alagoas" : "AL",
  "amapá": "AP",
  "amazonas": "AM",
  "bahia": "BA",
  "ceará": "CE",
  "distrito federal": "DF",
  "espírito santo": "ES",
  "goiás": "GO",
  "maranhão": "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  "pará": "PA",
  "paraíba": "PB",
  "paraná": "PR",
  "pernanbuco": "PE",
  "rio grande do sul": "RS",
  "rondônia": "RO",
  "roraima": "RR",
  "santa catarina": "SC",
  "são paulo": "SP",
  "sergipe": "SE",
  "tocantins": "TO"
}

const getCovidData = function(state) {

  const stateParam = !state ? '' : '&state=' + STATES[state];

  const statesReqOptions = {
      hostname: 'brasil.io',
      path: '/api/dataset/covid19/caso/data/?place_type=state&is_last=True&format=json' + stateParam,
      method: 'GET'
  };

  const brazilReqOptions = {
    hostname: 'api.covid19api.com',
    path: '/total/dayone/country/brazil',
    method: 'GET'
  }

  const reqOptions = !state || stateParam === 'BR' ? brazilReqOptions : statesReqOptions;
  
  console.log('state=' + state);
  console.log('stateParam=' + stateParam);
  console.log(reqOptions);

  return new Promise((resolve, reject) => {
      const covidReq = https.request(reqOptions, (response) => {
          const chunks = [];
          response.on('data', (data) => {
              chunks.push(data);
          });
          response.on('end', (end) => {
              const responseString = chunks.join('');
              // console.log(responseString);
              resolve(JSON.parse(responseString));
          });
      });
      
      covidReq.on('error', (error) => {
          console.log('covidReq error');
          console.log(error);
          reject(error);
      });

      covidReq.end();
  });
}

// core functionality for fact skill
const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    // gets a random fact by assigning an array to the variable
    // the random item from the array will be selected by the i18next library
    // the i18next library is set up in the Request Interceptor
    const randomFact = requestAttributes.t('FACTS');
    // concatenates a standard message with the random fact
    const speakOutput = requestAttributes.t('GET_FACT_MESSAGE') + randomFact;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};

const DadaSourceHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'dataSource';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak('Os dados que tenho a disposição para consulta são extraídos do projeto brasil aiô.')
      .reprompt('deseja saber mais?')
      .getResponse();
  },
};

const ContaminationHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'caseContamination';
  },
  async handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const responseBuilder = handlerInput.responseBuilder;
    
    const state = handlerInput.requestEnvelope.request.intent.slots.location.value;
    
    console.log('consulta casos. ' + state);

    try {
      const statesCall = getCovidData(state);
      const covidData = await statesCall;
      
      if (covidData.length === 0) {
          return responseBuilder
              .speak("hmm que estranho, não consegui ler os dados no momento")
              .getResponse();
      }

      const cases = covidData.results[0].confirmed;

      return handlerInput.responseBuilder
        .speak('O número de casos confirmados em ' + state + ' é de ' + cases)
        .reprompt('deseja saber mais?')
        .getResponse();
      } catch (err) {
        console.log(`Error processing events request: ` + err);
        return responseBuilder
          .speak('Desculpe, não consegui obter os dados de hoje')
          .getResponse();
      }
  }
};

const DeathsHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'caseDeaths';
  },
  async handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const responseBuilder = handlerInput.responseBuilder;
    
    const state = handlerInput.requestEnvelope.request.intent.slots.location.value;
    
    console.log('consulta mortes. ' + state);

    try {
      const statesCall = getCovidData(state);
      const covidData = await statesCall;
      
      if (covidData.length === 0) {
          return responseBuilder
              .speak("hmm que estranho, não consegui ler os dados no momento")
              .getResponse();
      }

      const deaths = covidData.results[0].deaths;

      return handlerInput.responseBuilder
        .speak('A quantidade de mortes em ' + state + ' é de ' + deaths)
        .reprompt('deseja saber mais?')
        .getResponse();
      } catch (err) {
        console.log(`Error processing events request: ` + err);
        return responseBuilder
          .speak('Desculpe, não consegui obter os dados de hoje')
          .getResponse();
      }
  }
};

const HomeHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.NavigateHomeIntent');
  },
  async handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
      
    try {
        const statesCall = getCovidData();
        const covidData = await statesCall;
        
        if (covidData.length === 0) {
            return responseBuilder
                .speak("hmm que estranho, não consegui ler os dados no momento")
                .getResponse();
        }

        const brazilData = covidData.pop();
                
        return responseBuilder
            .speak('A contagem atual no brasil é de ' + brazilData.Confirmed + ' casos confirmados,  e a de mortes é de ' + brazilData.Deaths)
            .reprompt('Eu também posso informar sobre os dados de um estado. Você pode pedir sobre casos ou óbitos.')
            .getResponse();
        
        
    } catch (err) {
      console.log(`Error processing events request: ` + err);
      return responseBuilder
        .speak('Desculpe, não consegui obter os dados de hoje no brasil')
        .getResponse();
    }
  },
};

const CaptureStateHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'IntentRequest' && request.intent.name === 'captureState';
  },
   handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
      
    const state = handlerInput.requestEnvelope.request.intent.slots.place.value;

    return responseBuilder  
      .speak('voce pediu sobre o estado de ' + state)
      .getResponse();

  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    // GetNewFactHandler,
    HomeHandler,
    CaptureStateHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
    DeathsHandler,
    ContaminationHandler,
    DadaSourceHandler
    
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();


// arn:aws:lambda:us-east-1:051150753579:function:2b920448-b709-4342-95d2-6a34ad609f81:Release_0