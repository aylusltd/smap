const https = require('https');
const {languages, partsOfSpeech} = require('../constants');
const {makeDenominatorFromLength} = require('../helpers');


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
  languageObj['Spanish']?console.log(languageObj['Spanish']['partGuess']):0;
  return languageObj;
}

module.exports={
  wikiParser,
  wikiFetch
}