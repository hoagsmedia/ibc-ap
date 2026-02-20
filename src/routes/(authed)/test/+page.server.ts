import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { testQuestions } from '$lib/test-questions';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return fail(401);
	}

	// If user has already passed, redirect to dashboard (unless they just passed)
	const justPassed = url.searchParams.get('passed') === 'true';
	if (locals.user.test_passed && !justPassed) {
		throw redirect(302, '/dashboard');
	}

	return {
		user: locals.user,
		questions: testQuestions
	};
};

export const actions: Actions = {
	submitTest: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, { message: 'Must be logged in to take the test' });
		}

		if (locals.user.test_passed) {
			return fail(400, { message: 'You have already passed the test' });
		}

		const formData = await request.formData();
		const answers: { [key: number]: number } = {};

		// Parse answers from form data
		for (const [key, value] of formData.entries()) {
			if (key.startsWith('question_')) {
				const questionId = parseInt(key.replace('question_', ''));
				const answerIndex = parseInt(value as string);
				answers[questionId] = answerIndex;
			}
		}

		// Validate that all questions were answered
		if (Object.keys(answers).length !== testQuestions.length) {
			return fail(400, {
				message: 'Please answer all questions before submitting the test',
				answers
			});
		}

		// Calculate score
		let correctAnswers = 0;
		const results: {
			questionId: number;
			correct: boolean;
			userAnswer: number;
			correctAnswer: number;
		}[] = [];

		for (const question of testQuestions) {
			const userAnswer = answers[question.id];
			const isCorrect = userAnswer === question.correctAnswer;

			if (isCorrect) {
				correctAnswers++;
			}

			results.push({
				questionId: question.id,
				correct: isCorrect,
				userAnswer,
				correctAnswer: question.correctAnswer
			});
		}

		const scorePercentage = Math.round((correctAnswers / testQuestions.length) * 100);
		const passed = scorePercentage === 100; // Must be 100% to pass

		// If passed, update user record (keep role as guest until admin assigns MBR)
		if (passed) {
			try {
				const testPassedDate = new Date();
				await db
					.update(users)
					.set({ test_passed: testPassedDate })
					.where(eq(users.id, locals.user.id));

				// Update the locals.user for immediate reflection
				locals.user.test_passed = testPassedDate;
			} catch (error) {
				console.error('Error updating test status:', error);
				return fail(500, { message: 'Error recording test results' });
			}

			// Redirect to the same page with a query parameter to show the dialog
			throw redirect(302, '/test?passed=true');
		} else {
			return {
				success: true,
				passed: false,
				score: correctAnswers,
				total: testQuestions.length,
				percentage: scorePercentage,
				message: `You scored ${scorePercentage}%. You need 100% to pass. Please review the club guidelines and try again.`,
				results
			};
		}
	}
};
