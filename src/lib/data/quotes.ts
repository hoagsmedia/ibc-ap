export interface Quote {
	text: string;
	author?: string;
	submitter?: string;
	date?: string;
}

export const quotes: Quote[] = [
	{
		text: 'Best Club on this side of the drink!',
		author: 'Ken May',
		date: '30 Oct 09'
	},
	{
		text: `Regular consumption of beer eliminates the weaker brain cells,\nmaking the brain a faster and more efficient machine. That's why you\nalways feel smarter after a few beers.`,
		author: 'Cliff Clavin',
		submitter: 'Richard Smith',
		date: '24 Mar 10'
	},
	{
		text: 'ALWAYS PLAN AHEAD! --- Buy two cases of beer.'
	},
	{
		text: 'Beer is proof that God loves us and wants us to be happy.',
		author: 'Benjamin Franklin'
	},
	{
		text: 'Beer is not just a breakfast beverage. It is a way of life.',
		author: 'COL Jack Holly, USMC'
	},
	{
		text: 'Finish your beer. There are sober folks in China.',
		author: 'Unknown'
	},
	{
		text: 'Remember "I" before "E", except in Budweiser.',
		author: 'Unknown'
	},
	{
		text: `Life's tough... it's even tougher if you're stupid.`,
		author: 'John Wayne'
	},
	{
		text: 'I read about the evils of drinking, I gave up reading.',
		author: 'Henny Youngman'
	},
	{
		text: `Everybody's got to believe in something.\nI believe I'll have another beer.`,
		author: 'W. C. Fields'
	},
	{
		text: `Alcohol - the cause of and the solution to - all of life's problems.`,
		author: 'Homer Simpson'
	},
	{
		text: 'Beer: Helping ugly people have sex since 1862.',
		author: 'Anonymous'
	}
];
