interface Config {
	include?: string;
	exclude?: string;
	translator: {
		[language: string]: 'dictionary' | ((source: string) => string);
	},
	explicit?: boolean;
	test?: (text: string) => boolean;
	instance: string;
};
