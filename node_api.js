const {tokenize} = require('./tokenizers');
const {languages, partsOfSpeech} = require('./constants');
const {assignParts, correctParts} = require('./parsers');
const {wikiParser, wikiFetch} = require('./backends');
const {collapseLanguagesToSentenceProbability, detectLanguage} = require('./lexers')









// TODO: Switch to Markov probabilities


async function run_tests(){
  // await wikiParser('test');
  // await wikiParser('him');  
  // const words = tokenize('The quick brown fox jumped over the lazy dog 123 $.');
  const words = tokenize('Yo quiero Taco Bell');
  // const words = tokenize('Ich fahre mit dem Auto zu dem Laden')
  // const sentence = Buffer.from('我開車去商店', 'utf-8').toString()
  // const words = tokenizer.tokenize(sentence);

  const languageObjects = await Promise.all(words.map(wikiParser));

  // console.log(languageObjects);
  const detectedLanguageProbabilities = collapseLanguagesToSentenceProbability(languageObjects);
  console.log(detectedLanguageProbabilities);
  const detectedLanguage = detectLanguage(detectedLanguageProbabilities);
  console.log(detectedLanguage);
  const parts = assignParts(languageObjects, detectedLanguage);
  // console.log(parts);
  const correctedParts = correctParts(parts, words, detectedLanguage);
  console.log(words);
  console.log(correctedParts);

  // console.log(languageObjects);

}

run_tests()

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