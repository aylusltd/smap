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

// https://tc39.es/ecma262/#table-unicode-script-values
const languageToScript = {
  'Mandarin': 'Han',
  'English': 'Latin',
  'Spanish': 'Latin',
  'Hindi': 'Devanagari',
  'Bengali': 'Bengali',
  'French': 'Latin',
  'Arabic': 'Arabic',
  'Russian': 'Cyrillic',
  'Portuguese': 'Latin',
  'Punjabi': ['Gurmukhi'], // Shahmukhi does not appear to be a named unicode script extension
  'Malay': 'Latin',
  'Indonesian': 'Latin',
  'German': 'Latin',
  'Japanese': ['Hiragana','Katakana'],
  'Wu': 'Han', // Guessing here. Wikipedia was no help.
  'Italian': 'Latin'
}

// TODO: Move tokenization to own file
// TODO: Create tokenization functions for each alphabet
const scripts = [
  'Han',
  // 'Latin',
  // 'Devanagari',
  // 'Bengali',
  // 'Arabic',
  // 'Cyrillic',
  // 'Gurmukhi',
  // 'Hiragana',
  // 'Katakana'
];

module.exports = {
  partsOfSpeech,
  languages,
  languageToScript,
  scripts
}