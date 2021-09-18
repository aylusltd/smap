const {tokenize} = require('./tokenizers');
const {languages, partsOfSpeech} = require('./constants');
const {assignParts, correctParts} = require('./parsers');
const {wikiParser, wikiFetch} = require('./backends');
const {collapseLanguagesToSentenceProbability, detectLanguage} = require('./lexers')

describe('English Test Suite', function () {
  const fixture={};
  beforeAll(async function(){
    fixture.words = tokenize('The quick brown fox jumped over the lazy dog 123 $.');
    fixture.languageObjects = await Promise.all(fixture.words.map(wikiParser));
    fixture.detectedLanguageProbabilities = collapseLanguagesToSentenceProbability(fixture.languageObjects);
    fixture.detectedLanguage = detectLanguage(fixture.detectedLanguageProbabilities);
    fixture.parts = assignParts(fixture.languageObjects, fixture.detectedLanguage);
    fixture.correctedParts = correctParts(fixture.parts, fixture.words, fixture.detectedLanguage);
  });
  it('should split a sentence into wors', function(){
    expect(fixture.words).toEqual(['The','quick','brown','fox','jumped','over','the','lazy','dog', '123'])
  })
  // const words=['test'];
  it('should return language objects', async function() {
    fixture.languageObjects.forEach((obj)=>{
      for(language in obj){
        expect(languages.includes(language)).toEqual(true);
        for(part in obj[language]['partGuess']){
          expect(partsOfSpeech.includes(part)).toEqual(true);
          expect(obj[language]['partGuess'][part]).toBeInstanceOf(Number);
          expect(obj[language]['partGuess'][part]).toBeGreaterThanOrEqual(0);
          expect(obj[language]['partGuess'][part]).toBeLessThanOrEqual(1);
        }
      }
    });
  });
    
  it('should detect language as "English"', ()=>{
    expect(fixture.detectedLanguage).toEqual('English');
  });

  it('should always think "the" is an "Article"', function() {
    expect(fixture.parts[0]).toEqual('Article');
    expect(fixture.parts[6]).toEqual('Article');
  });
  it('should properly parse the sample sentence', ()=>{
    expect(fixture.parts).toEqual([ 'Article', 'Adjective', 'Adjective', 'Noun', 'Verb', 'Adverb', 'Article', 'Adjective', 'Noun' ])
  });
})

// async function run_tests(){
//   const words = tokenize('Yo quiero Taco Bell');
//   // const words = tokenize('Ich fahre mit dem Auto zu dem Laden')
//   // const sentence = Buffer.from('我開車去商店', 'utf-8').toString()
//   // const words = tokenizer.tokenize(sentence);



//   // console.log(words);
//   // console.log(correctedParts);

//   // console.log(languageObjects);

// }

// run_tests()