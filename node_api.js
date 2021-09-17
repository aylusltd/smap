const https = require('https');

const partsOfSpeech = [
  'Adjective',
  'Adverb',
  'Article',
  'Conjunction',
  'Determiner',
  'Exclamation',
  'Interjection',
  'Noun',
  'Numeral',
  'Particle',
  'Postposition',
  'Preposition',
  'Pronoun',
  'Proper Noun',
  'Verb'
]

const languages = [
  'Mandarin',
  'English',
  'Spanish',
  'Hindi',
  'Bengali',
  'French',
  'Arabic',
  'Russian',
  'Portuguese',
  'Punjabi',
  'Malay',
  'Indonesian',
  'German',
  'Japanese',
  'Wu',
  'Italian'
];

function wikiFetch(word){
  // console.log('wikiFetch');
  return new Promise((resolve, reject) => {
    // console.log("Fetching:", word);
    word=word.toLowerCase();
    const options = {
      hostname: 'en.wiktionary.org',
      port: 443,
      path: `/w/api.php?action=parse&page=${word}&format=json&prop=sections`,
      method: 'GET'
    };

    const req = https.request(options);
    let data = '';

    req.on('error', error => {
      reject(error);
    });

    req.on('response', res => {
      // console.log('data received');
      res.on('data', (chunk)=>{data+=`${chunk}`})
      res.on('end', ()=>{resolve(JSON.parse(data))})
    });

    req.end();
  })
}

function makeDenominatorFromLength(len){
  return (len/2)*(len+1);
}

async function wikiParser(word){
  const response = await wikiFetch(word);
  if(response.parse === undefined){
    return
  }
  const sections=response.parse.sections;
  // console.log(sections);
  const languageObj={}
  let rank=1;
  languages.forEach((language)=>{
    // console.log(language);
    const targetLanguageSections = sections.filter((section)=>{return section.line == language})
    if(targetLanguageSections.length == 0){
      return;
    }
    
    languageObj[language]={};
    const targetLanguageNumber = targetLanguageSections[0].number
    const targetLanguageSubsections = sections.filter((section)=>{
      return section.number.slice(0,targetLanguageNumber.length+1) == targetLanguageNumber+'.'
    });
    const targetLanguageParts = targetLanguageSubsections.filter((section)=>partsOfSpeech.includes(section.line));
    const denominator = makeDenominatorFromLength(targetLanguageParts.length);
    const partGuess = {}
    // console.log(targetLanguageSubsections)
    // console.log(targetLanguageParts);
    targetLanguageParts.forEach((section, idx)=>{
      if(partsOfSpeech.includes(section.line)){
        if(partGuess[section.line]){
          partGuess[section.line] += (targetLanguageParts.length - idx)/denominator;
        } else {
          partGuess[section.line] = (targetLanguageParts.length - idx)/denominator;          
        }
      }
    });
    languageObj[language]['partGuess'] = partGuess;
    languageObj[language]['rank'] = rank;
    rank++;
  });
  rank--;
  const languageDenominator = makeDenominatorFromLength(rank);
  for(language in languageObj){
    languageObj[language]['probability'] = (rank-languageObj[language]['rank']+1)/languageDenominator;
  }
  // console.log(word)
  // console.log(languageObj)
  return languageObj;
}

// TODO: Expand for languages that don't use spaces
function tokenize(sentence){
  const stripped=sentence.replace(/[^a-zA-Z\s\d:]/gi,' ');
  const words = stripped.split(' ').filter((word)=>word.length>0);
  // console.log(words);
  return words;
}

function collapseLanguagesToSentenceProbability(sentenceObjects){
  sentenceObjects = sentenceObjects.filter((a)=>!!a);
  // console.log(sentenceObjects);
  probabilities = sentenceObjects.reduce((p,lO)=>{
    for(language in lO){
      // console.log(language);
      if(language in p){
        p[language]+= lO[language]['probability'];
      } else {
        p[language] = lO[language]['probability'];
      }
    }
    return p;
  },{});
  // console.log(probabilities);
  let max = 0;
  for(language in probabilities){
    max+=probabilities[language];
  }
  for(language in probabilities){
    probabilities[language] = probabilities[language]/max;
  }
  // console.log(probabilities);
  return probabilities;
}

function detectLanguage(languagesProbabilities, victoryMargin=0){
  let topScore = 0;
  let secondPlace = 0;
  let topLanguage = undefined;
  for(language in languagesProbabilities) {
    if(languagesProbabilities[language]>=topScore){
      topLanguage = language;
      secondPlace = topScore;
      topScore = languagesProbabilities[language];
    }
  }
  if(topScore - secondPlace < victoryMargin){
    topLanguage = undefined;
  }
  return topLanguage;
}

// TODO: Switch to Markov probabilities
function assignParts(objects, expectedLanguage){
  objects = objects.filter((a)=>!!a);
  const parts = objects.map((word) => {
    // console.log(word);
    let wordToAnalyze;
    let topScore = 0;
    let topLanguage = undefined;
    for (language in word){
      if(word[language]['probability']>=topScore){
        topLanguage = language;
        topScore = word[language]['probability'];
      }
    }

    if(expectedLanguage in word){
      wordToAnalyze = word[expectedLanguage]['partGuess'];
    } else {
      wordToAnalyze = word[topLanguage]['partGuess'];
    }
    let topPartScore = 0;
    let topPart = undefined;
    for(part in wordToAnalyze){
      // wordToAnalyze = wordToAnalyze[part]
    
      if(wordToAnalyze[part] > topPartScore){
        topPartScore = wordToAnalyze[part];
        topPart = part;
      }
    }
    return topPart;
  });
  return parts;
}

function isCapitalized(word){
  return word[0] == word[0].toUpperCase();
}

function isAllCaps(word){
  return word == word.toUpperCase();
}

// TODO: Switch to Hidden Markov Model from Brown Corpus
// TODO: Make language specific grammar rules (these won't work in German or Spanish)
function correctParts(parts, tokens, language){
  const myTokens = tokens.filter((a)=>!!a);
  const tuplesMap=[
    {
      'input': ['Noun', 'Noun'],
      'output': ['Adjective', 'Noun']
    },
    {
      'input': ['Verb', 'Adjective', 'Article'],
      'output': ['Verb', 'Adverb', 'Article']
    }
  ];
  function consolidateTokens(parts,tokens){
    lastCapitalized = false;
    tokens.forEach((token, index) => {
      if(lastCapitalized && isCapitalized(token)){
        parts.splice(index-1, 2, 'Proper Noun');
        tokens.splice(index-1, 2, tokens.slice(index-1,index+1).join(' '));
      }
      lastCapitalized = isCapitalized(token);
    })
  }
  function correctGermanCapitalized(parts, tokens){
    return parts.map((part, idx) => {
      if(isCapitalized(tokens[idx]) && idx > 0 && (part != 'Noun' || part!='Proper Noun')){
        return 'Noun';
      } else {
        return part
      }
    })
  }
  consolidateTokens(parts, tokens);
  if(language == 'German'){
    parts = correctGermanCapitalized(parts, tokens)  
  }
  let rulesMatched = []
  let indices = []
  parts.forEach((part, index, arr) => {
    // console.log(indices);
    rulesMatched.forEach((rule, idx, rules)=>{
      if(part == rules[idx]['input'][indices[idx]]){
        // Leave it in the list unless whole rule matched
        if(indices[idx] == (rules[idx]['input'].length -1)){
          // Whole rule matched
          // console.log('rule matched');
          // console.log('Index:', index);
          // console.log('Length:', rules[idx]['input'].length);
          // console.log('Splice', rules[idx]['output'])

          parts.splice(index-rules[idx]['input'].length+1, rules[idx]['input'].length, ...rules[idx]['output'])
          rules.splice(idx,1);
          indices.splice(idx,1);
        } else {
          indices[idx]++;
        }
      } else {
        // remove it
        // console.log(rule['input']);
        // console.log(indices[idx]);
        // console.log('Received:', part);
        // console.log('Expected:', rule['input'][indices[idx]])
        rules.splice(idx,1);
        indices.splice(idx,1);  
      }
      
    });
    tuplesMap.forEach((rule)=>{
      if(part == rule['input'][0]){
        rulesMatched.push(rule);
        indices.push(1)
        // console.log(rulesMatched);

      } else {
        // console.log('Received:',part);
        // console.log('Expected:',rule['input'][0])
      }
    });
  });
  return parts;
}

async function run_tests(){
  // await wikiParser('test');
  // await wikiParser('him');  
  // const words = tokenize('The quick brown fox jumped over the lazy dog 123 $.');
  // const words = tokenize('Yo quiero Taco Bell');
  const words = tokenize('Ich fahre mit dem Auto zu dem Laden')

  const languageObjects = await Promise.all(words.map(wikiParser));
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