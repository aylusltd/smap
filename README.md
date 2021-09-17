# smap
Multilingual Sentence Mapper
`const smap = require('<path>/<to>/node_api.js')`

Smap stands for Sentence Mapper. 

Smap uses wiktionary to identify words, languages, and their parts of speech. Consider it like a poor man's light weight SpaCy for JS.

Smap exports many things, including:
```
  languages,      // List of top 30 languages as they appear in Wiktionary
  partsOfSpeech,  // Supported parts of speech
  wikiParser,     // Function to fetch and parse data from Wiktionary
  wikiFetch,      // Function just for fetching
  tokenize,       // A rudimentary tokenizer. Breaks sentences into words to look up on Wiktionary
  collapseLanguagesToSentenceProbability,   // This guesses the sentence's language, based on the most likely language of each word
  detectLanguage, // Estimates the most likely language of each word, based on the order listed in Wiktionary
  assignParts,    // Chooses the most probable part based solely on Wiktionary
  correctParts    // Corrects part of speech with language specific grammar rules
```


Possible Improvements:
* Add definitions
* A better ReadMe
