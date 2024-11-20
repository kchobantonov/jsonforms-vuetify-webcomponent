import type { Localize } from 'ajv-i18n/localize/types';

export const localize_bg: Localize = (errors) => {
  if (!(errors && errors.length)) return;
  for (const e of errors) {
    let out;
    let n;
    let cond;
    switch (e.keyword) {
      case 'additionalItems':
      case 'items':
        out = '';
        n = e.params.limit;
        out += 'не трябва да има повече от ' + n + ' елемент';
        if (n != 1) {
          out += 'а';
        }
        break;
      case 'additionalProperties':
        out = 'не трябва да има допълнителни полета';
        break;
      case 'anyOf':
        out = 'трябва да съответства на схема в "anyOf"';
        break;
      case 'const':
        out = 'трябва да бъде равно на константа';
        break;
      case 'contains':
        out = 'трябва да съдържа валиден елемент';
        break;
      case 'dependencies':
      case 'dependentRequired':
        out = '';
        n = e.params.depsCount;
        out += 'трябва да има поле';
        if (n != 1) {
          out += 'та';
        }
        out +=
          ' ' +
          e.params.deps +
          ' когато полето ' +
          e.params.property +
          ' е налично';
        break;
      case 'discriminator':
        switch (e.params.error) {
          case 'tag':
            out = 'полето "' + e.params.tag + '" трябва да бъде низ';
            break;
          case 'mapping':
            out =
              'стойноста на полето "' +
              e.params.tag +
              '" трябва да бъде в oneOf';
            break;
          default:
            out =
              'трябва да премине валидацията на ключовата дума "' +
              e.keyword +
              '"';
        }
        break;
      case 'enum':
        out = 'трябва да бъде равно на едно от разрешените стойности';
        break;
      case 'false schema':
        out = 'схемата е равна на false';
        break;
      case 'format':
        out = 'трябва да съответства на формата "' + e.params.format + '"';
        break;
      case 'formatMaximum':
      case 'formatExclusiveMaximum':
        out = '';
        cond = e.params.comparison + ' ' + e.params.limit;
        out += 'трябва да бъде ' + cond;
        break;
      case 'formatMinimum':
      case 'formatExclusiveMinimum':
        out = '';
        cond = e.params.comparison + ' ' + e.params.limit;
        out += 'трябва да бъде ' + cond;
        break;
      case 'if':
        out =
          'трябва да съответства на схемата "' + e.params.failingKeyword + '"';
        break;
      case 'maximum':
      case 'exclusiveMaximum':
        out = '';
        cond = e.params.comparison + ' ' + e.params.limit;
        out += 'трябва да бъде ' + cond;
        break;
      case 'maxItems':
        out = '';
        n = e.params.limit;
        out += 'не трябва да има повече от ' + n + ' елемент';
        if (n != 1) {
          out += 'а';
        }
        break;
      case 'maxLength':
        out = '';
        n = e.params.limit;
        out += 'не трябва да бъде по-дълго от ' + n + ' символ';
        if (n != 1) {
          out += 'а';
        }
        break;
      case 'maxProperties':
        out = '';
        n = e.params.limit;
        out += 'не трябва да има повече от ' + n + ' поле';
        if (n != 1) {
          out += 'та';
        }
        break;
      case 'minimum':
      case 'exclusiveMinimum':
        out = '';
        cond = e.params.comparison + ' ' + e.params.limit;
        out += 'трябва да бъде ' + cond;
        break;
      case 'minItems':
        out = '';
        n = e.params.limit;
        out += 'не трябва да има по-малко от ' + n + ' елемент';
        if (n != 1) {
          out += 'а';
        }
        break;
      case 'minLength':
        out = '';
        n = e.params.limit;
        out += 'не трябва да бъде по-късо от ' + n + ' символ';
        if (n != 1) {
          out += 'а';
        }
        break;
      case 'minProperties':
        out = '';
        n = e.params.limit;
        out += 'не трябва да има по-малко от ' + n + ' поле';
        if (n != 1) {
          out += 'та';
        }
        break;
      case 'multipleOf':
        out = 'трябва да бъде кратно на ' + e.params.multipleOf;
        break;
      case 'not':
        out = 'не трябва да бъде валидно съгласно схемата в "not"';
        break;
      case 'oneOf':
        out = 'трябва да съответства точно на една схема в "oneOf"';
        break;
      case 'pattern':
        out = 'трябва да съответства на шаблон "' + e.params.pattern + '"';
        break;
      case 'patternRequired':
        out =
          'трябва да има поле, което съответства на шаблон "' +
          e.params.missingPattern +
          '"';
        break;
      case 'propertyNames':
        out = 'името на полето е невалидно';
        break;
      case 'required':
        out = 'трябва да има задължително поле ' + e.params.missingProperty;
        break;
      case 'type':
        out = 'трябва да бъде ' + e.params.type;
        break;
      case 'unevaluatedItems':
        out = '';
        n = e.params.len;
        out += 'не трябва да има повече от ' + n + ' елемент';
        if (n != 1) {
          out += 'а';
        }
        break;
      case 'unevaluatedProperties':
        out = 'не трябва да има непроверени полета';
        break;
      case 'uniqueItems':
        out =
          'не трябва да има дублиращи се елементи (елементи ## ' +
          e.params.j +
          ' и ' +
          e.params.i +
          ' са идентични)';
        break;
      default:
        out =
          'трябва да премине валидацията на ключовата дума "' + e.keyword + '"';
    }
    e.message = out;
  }
};
