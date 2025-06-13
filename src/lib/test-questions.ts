// Island Beer Club Official Test Questions
export interface TestQuestion {
	id: number;
	question: string;
	options: string[];
	correctAnswer: number;
	explanation?: string;
}

export const testQuestions: TestQuestion[] = [
	{
		id: 1,
		question: 'Who are the five Founders of the Island Beer Club?',
		options: [
			'Jeff "Bones" Wilkens, Wayne "Big Oly" Oldendorph, John "Old Doc" Morton, John "Cruncher" Muncy and Rob "Crenny" Crenshaw',
			'John Lennon, Ringo Starr, George Harrison, Paul McCartney and Stuart Sutcliffe',
			'Tom Smisek, Casey Tanaka, Richard Bailey, Mike Woiwode and Bill Sandke',
			'Bernie Madoff, Duke Cunningham, Andrew Fastow, Jeffrey Skilling and Charles Ponzi'
		],
		correctAnswer: 0,
		explanation:
			'The five founding members established the Island Beer Club and remain legendary figures in IBC history.'
	},
	{
		id: 2,
		question: 'When was the Island Beer Club founded?',
		options: ['March 22, 2004', 'December 25, 2008', 'October 2, 2012', 'June 8, 1960'],
		correctAnswer: 0,
		explanation:
			'The Island Beer Club was founded on March 22, 2004, marking the beginning of a legendary brotherhood.'
	},
	{
		id: 3,
		question: 'What afternoon T.V. show did members watch in the early days of the Beer Club?',
		options: ['Oprah', 'Jerry Springer', 'Days of Our Lives', 'Beers Around the World'],
		correctAnswer: 1,
		explanation:
			'In the early days, members would gather to watch Days of Our Lives, creating shared memories and traditions.'
	},
	{
		id: 4,
		question: 'What is the motto of the Island Beer Club?',
		options: [
			'We have more time than money',
			'Beer rules the world',
			'Alley lingerers will be shot',
			'All for one and one for all'
		],
		correctAnswer: 0,
		explanation:
			'"We have more time than money" perfectly captures the IBC philosophy of prioritizing friendship and good times over material wealth.'
	},
	{
		id: 5,
		question: 'What is the domain name of the IBC website?',
		options: [
			'www.coorslightsucks.com',
			'www.coronadoalcoholics.org',
			'www.islandbeerclub.com',
			'www.oldguysrule.com'
		],
		correctAnswer: 2,
		explanation: 'The official IBC website can be found at www.islandbeerclub.com.'
	},
	{
		id: 6,
		question: 'What is the name of the alley where the IBC is located?',
		options: ['Brewpub Lane', 'Beer Belly Blvd.', 'Ale Avenue', 'Stella Street'],
		correctAnswer: 2,
		explanation:
			'The Island Beer Club headquarters is located on Stella Street, the heart of IBC operations.'
	},
	{
		id: 7,
		question: 'How many kegerators are in the Island Beer Club Headquarters?',
		options: ['3', '1', '121', 'None of the above'],
		correctAnswer: 0,
		explanation:
			'The IBC headquarters features 3 kegerators to ensure a proper selection of craft beers for members.'
	},
	{
		id: 8,
		question:
			'What is the highest mountain that an IBC member climbed to display the Beer Club banner?',
		options: ['Mt. Whitney', 'Mt. Everest', 'Mt Kilimanjaro', 'K2'],
		correctAnswer: 2,
		explanation:
			'An IBC member proudly displayed the Beer Club banner atop Mt. Kilimanjaro, bringing IBC spirit to new heights.'
	},
	{
		id: 9,
		question: 'When does the Beer Club meet?',
		options: [
			'Every Wednesday, 4:00 PM to 6:00 PM (Standard Time); 4:30 PM to 6:30 PM (Daylight Savings Time)',
			'Every other Thursday, 1:00 PM to 9:00 PM',
			'Whenever Bones was in town',
			'Every day, 4:30 PM to 6:30 PM'
		],
		correctAnswer: 0,
		explanation:
			'The IBC has regular Wednesday meetings with times adjusted for Standard vs. Daylight Savings Time.'
	},
	{
		id: 10,
		question: 'As of June 2020 how many members are in the Island Beer Club?',
		options: ['52', '912', '407', '357'],
		correctAnswer: 2,
		explanation: 'As of June 2020, the Island Beer Club had grown to 52 members worldwide.'
	},
	{
		id: 11,
		question: 'What are IBUs?',
		options: [
			'Island Beer Unequal',
			'International Bittering Units',
			'Integrated Business Units',
			'I Beer Up'
		],
		correctAnswer: 1,
		explanation:
			'IBU stands for International Bittering Units, a measure of hop bitterness in beer.'
	},
	{
		id: 12,
		question: 'How many kegs have been purchased since the inception of Beer Club in 2004?',
		options: ['59+', '220+', '700+', '962'],
		correctAnswer: 2,
		explanation:
			'Since 2004, the IBC has purchased over 700 kegs, demonstrating their commitment to quality craft beer.'
	}
];

export const PASSING_SCORE = 8; // 80% passing rate
export const TOTAL_QUESTIONS = testQuestions.length;
