const {tokenize} = require('./tokenizers');
const {languages, partsOfSpeech} = require('./constants');
const {assignParts, correctParts} = require('./parsers');
const {wikiParser, wikiFetch} = require('./backends');
const {collapseLanguagesToSentenceProbability, detectLanguage} = require('./lexers')

module.exports = {
  languages,
  partsOfSpeech,
  wikiParser,
  wikiFetch,
  tokenize,
  collapseLanguagesToSentenceProbability,
  detectLanguage,
  assignParts,
  correctParts
}