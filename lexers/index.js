const constants = require('../constants');
const {languages, partsOfSpeech} = constants

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

module.exports = {
  collapseLanguagesToSentenceProbability,
  detectLanguage
}