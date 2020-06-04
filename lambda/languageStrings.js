/* *
 * We create a language strings object containing all of our strings.
 * The keys for each string will then be referenced in our code, e.g. handlerInput.t('WELCOME_MSG').
 * The localisation interceptor in index.js will automatically choose the strings
 * that match the request's locale.
 * */

module.exports = {
    pt: {
        translation: {
            SKILL_NAME: 'Dados covid dezenove',
            HELP_MESSAGE: 'Você pode me perguntar por dados de pessoas contaminadas ou de óbito por estado, ou, fexar a skill. Como posso ajudar?',
            HELP_REPROMPT: 'O que deseja saber?',
            FALLBACK_MESSAGE: 'Não tenho uma resposta para isso. Apenas posso tentar buscar os dados da pandemia por estado, ou a soma do Brasil. Como posso ajudar?',
            FALLBACK_REPROMPT: 'Eu posso contar dados sobre a pandemia de corona vírus no Brasil. Como posso ajudar?',
            ERROR_MESSAGE: 'Desculpa, algo deu errado.',
            STOP_MESSAGE: 'Tchau!',
            FACTS:
            [
                'Um ano em Mercúrio só dura 88 dias.',
                'Apesar de ser mais distante do sol, Venus é mais quente que Mercúrio.',
                'Visto de marte, o sol parece ser metade to tamanho que nós vemos da terra.',
                'Júpiter tem os dias mais curtos entre os planetas no nosso sistema solar.',
                'O sol é quase uma esfera perfeita.',
            ],
        }
    }
}