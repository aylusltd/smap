const constants = require('../constants');
const {languages, partsOfSpeech} = constants

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

module.exports = {
  assignParts,
  correctParts
}