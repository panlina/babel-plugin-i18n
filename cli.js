#!/usr/bin/env node

var [, , command, ...args] = process.argv;
switch (command) {
	case 'generate-dictionary':
		var [file, language] = args;
		require('./generateDictionary')(file, language);
		break;
	case 'update-dictionary':
		var [file, language] = args;
		require('./updateDictionary')(file, language);
		break;
	case 'translate-dictionary':
		var [source, dictionary] = args;
		require('./translateDictionary')(source, dictionary);
		break;
	case 'generate-report':
		var [file, language] = args;
		require('./generateReport')(file, language);
		break;
	case 'generate-dictionary-report':
		var [file, language] = args;
		require('./generateDictionaryReport')(file, language);
		break;
}
