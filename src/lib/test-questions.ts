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
		question: 'What is the primary rule regarding beer consumption at IBC events?',
		options: [
			'Members must drink at least 3 beers per event',
			'Only craft beer is allowed',
			'Drink responsibly and know your limits',
			'Beer must be consumed within 30 minutes of opening'
		],
		correctAnswer: 2,
		explanation:
			'The Island Beer Club prioritizes responsible drinking and member safety above all else.'
	},
	{
		id: 2,
		question: 'How should new members be welcomed to the club?',
		options: [
			'With a formal initiation ceremony',
			'By ignoring them until they prove themselves',
			'With warmth, inclusivity, and introduction to club traditions',
			'By challenging them to a drinking contest'
		],
		correctAnswer: 2,
		explanation: 'IBC values creating a welcoming and inclusive environment for all members.'
	},
	{
		id: 3,
		question: 'What is the appropriate behavior during club meetings?',
		options: [
			'Respectful participation and listening to others',
			'Constant interruption to show enthusiasm',
			'Silent observation only',
			'Debating every point aggressively'
		],
		correctAnswer: 0,
		explanation:
			'Club meetings should be conducted with mutual respect and active, thoughtful participation.'
	},
	{
		id: 4,
		question: 'How should conflicts between members be handled?',
		options: [
			'Through public confrontation at events',
			'By involving the entire membership in the dispute',
			'With maturity, direct communication, and club leadership if needed',
			'By excluding one of the parties from future events'
		],
		correctAnswer: 2,
		explanation:
			'Conflicts should be resolved maturely and privately, with leadership assistance when necessary.'
	},
	{
		id: 5,
		question: "What is the club's stance on diversity and inclusion?",
		options: [
			'Only certain types of people fit the club culture',
			"Diversity is welcomed as long as it doesn't change traditions",
			'The club actively welcomes and celebrates diversity in all forms',
			'Diversity is not a consideration for membership'
		],
		correctAnswer: 2,
		explanation:
			'The Island Beer Club is committed to being an inclusive community that welcomes all people.'
	},
	{
		id: 6,
		question: 'What should you do if you notice a fellow member has had too much to drink?',
		options: [
			'Encourage them to drink more to keep up with the group',
			"Ignore it - it's not your responsibility",
			'Look out for their safety and help them get home safely',
			'Mock them for not being able to handle their alcohol'
		],
		correctAnswer: 2,
		explanation: "Members should always look out for each other's safety and wellbeing."
	},
	{
		id: 7,
		question: 'How should club events and venues be treated?',
		options: [
			'As opportunities to party without consequences',
			'With respect, cleanliness, and consideration for others',
			"As places where normal social rules don't apply",
			'With casual disregard since someone else will clean up'
		],
		correctAnswer: 1,
		explanation: 'Club members should always show respect for venues and clean up after themselves.'
	},
	{
		id: 8,
		question: 'What is the purpose of the Island Beer Club?',
		options: [
			'To drink as much beer as possible',
			"To exclude people who don't fit in",
			'To build lasting friendships through shared appreciation of beer and good times',
			'To compete with other drinking organizations'
		],
		correctAnswer: 2,
		explanation:
			'The IBC is fundamentally about building community and lasting friendships centered around beer appreciation.'
	},
	{
		id: 9,
		question: 'How should members represent the club in public?',
		options: [
			'By being as loud and attention-seeking as possible',
			'With pride, respect, and positive behavior that reflects club values',
			'By keeping club membership secret',
			'By challenging others to drinking contests'
		],
		correctAnswer: 1,
		explanation:
			'Members are ambassadors of the club and should represent it positively in all settings.'
	},
	{
		id: 10,
		question: 'What is the most important aspect of being an IBC member?',
		options: [
			'Having the highest alcohol tolerance',
			'Knowing the most about beer varieties',
			'Contributing positively to the club community and friendships',
			'Attending every single event'
		],
		correctAnswer: 2,
		explanation:
			'The heart of IBC membership is about contributing to a positive, supportive community.'
	}
];

export const PASSING_SCORE = 8; // 80% passing rate
export const TOTAL_QUESTIONS = testQuestions.length;
