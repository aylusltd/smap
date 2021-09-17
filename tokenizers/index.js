const constants=require('../constants');

// TODO: This is a horrible stub
function tokenizeHan(sentence){
  console.log('Han Sentence:', sentence);
  const words = sentence.split('');
  console.log('Han Words:', words);
  return words;
}

// TODO: Expand for languages that don't use spaces
function tokenize(sentence){
  const containsNonLatin = constants.scripts.reduce((reducer, script)=>{
    const re = new RegExp(`[\p{Script_Extensions=${script}}]`, 'u')
    console.log(script);
    console.log(re);
    console.log(sentence);
    const scriptMatch = sentence.match(re);
    console.log('scriptMatch:',scriptMatch);
    return reducer || !!scriptMatch;
  }, false);  

  console.log('containsNonLatin:', containsNonLatin);
  // if(!containsNonLatin){
  if(true){
    const stripped=sentence.replace(/[^a-zA-Z\s\d:]/gi,' ');
    const words = stripped.split(' ').filter((word)=>word.length>0);
    // console.log(words);
    return words;  
  } else {
    return tokenizeHan(sentence);
  }
  
}

module.exports = {
  tokenizeHan,
  tokenize
}