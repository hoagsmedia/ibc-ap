<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button } from "$lib/components/ui/button";
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogFooter
	} from "$lib/components/ui/dialog";
	import { Label } from "$lib/components/ui/label";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import * as Alert from "$lib/components/ui/alert";
	import { CheckCircle, XCircle, BookOpen } from "@lucide/svelte/icons";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";

	let { data, form } = $props();

	let loading = $state(false);
	let selectedAnswers = $state<Record<number, number>>({});

	let showResults = $derived(form?.success === true);
	let testPassed = $derived(form?.passed === true);
	let showPassDialog = $state(false);

	$effect(() => {
		const justPassed = page.url.searchParams.get("passed") === "true";
		if (justPassed && data.user?.test_passed) {
			showPassDialog = true;
		}
	});

	function navigateToDashboard() {
		goto("/dashboard");
	}
</script>

<svelte:head>
	<title>IBC Official Test | Island Beer Club</title>
	<meta
		name="description"
		content="Complete the Island Beer Club official test to unlock invitation privileges"
	/>
</svelte:head>

<div class="mx-auto w-full max-w-4xl px-2 py-3 sm:px-4 sm:py-5">
	{#if !showResults}
		<section class="space-y-5">
			<div class="space-y-3 px-1 text-center sm:px-0">
				<div class="bg-primary mx-auto flex size-11 items-center justify-center rounded-full">
					<BookOpen class="text-primary-foreground size-5" />
				</div>
				<div class="space-y-2">
					<h1 class="text-foreground text-2xl font-bold sm:text-3xl">IBC Official Test</h1>
					<p class="text-muted-foreground mx-auto max-w-2xl text-sm sm:text-base">
						Before you can create invitation links, please complete this test about Island Beer Club
						values and guidelines. You need to answer 100% correctly to pass.
					</p>
				</div>
			</div>

			{#if form?.message && !form?.success}
				<Alert.Root class="mx-1 sm:mx-0" variant="destructive">
					<Alert.Title>Error</Alert.Title>
					<Alert.Description>{form.message}</Alert.Description>
				</Alert.Root>
			{/if}

			<form
				method="POST"
				action="?/submitTest"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-4 sm:space-y-5"
			>
				{#if data.questions}
					{#each data.questions as question (question.id)}
						<Card class="border-border overflow-hidden shadow-sm">
							<CardHeader class="space-y-3 px-4 py-4 sm:px-5">
								<div>
									<Badge
										variant="secondary"
										class="rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase"
									>
										Question {question.id}
									</Badge>
								</div>
								<CardTitle class="text-base leading-snug font-semibold sm:text-lg">
									{question.question}
								</CardTitle>
							</CardHeader>
							<CardContent class="space-y-2 px-4 pb-4 sm:px-5 sm:pb-5">
								{#each question.options as option, optionIndex (question.id + "-" + optionIndex)}
									<Label
										class="border-border hover:bg-muted/50 flex cursor-pointer items-start space-x-3 rounded-lg border p-3 transition-colors sm:items-center"
									>
										<input
											type="radio"
											name="question_{question.id}"
											value={optionIndex}
											bind:group={selectedAnswers[question.id]}
											disabled={loading}
											class="text-primary focus:ring-primary mt-0.5 sm:mt-0"
										/>
										<span class="text-foreground text-sm leading-relaxed sm:text-[15px]"
											>{option}</span
										>
									</Label>
								{/each}
							</CardContent>
						</Card>
					{/each}
				{/if}

				<div class="flex justify-center pt-2 sm:pt-4">
					<Button
						type="submit"
						disabled={loading ||
							Object.keys(selectedAnswers).length < (data.questions?.length || 0)}
						class="min-w-[12rem] px-8"
					>
						{#if loading}
							<div
								class="border-primary-foreground mr-2 size-4 animate-spin rounded-full border-2 border-t-transparent"
							></div>
						{/if}
						Submit Test
					</Button>
				</div>
			</form>
		</section>
	{:else}
		<Card class="border-border shadow-lg">
			<CardHeader class="text-center">
				<div
					class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full {testPassed
						? 'bg-green-600'
						: 'bg-destructive'}"
				>
					{#if testPassed}
						<CheckCircle class="size-6 text-white" />
					{:else}
						<XCircle class="size-6 text-white" />
					{/if}
				</div>
				<CardTitle class="text-foreground text-2xl font-bold">
					{testPassed ? "Congratulations! 🎉" : "Test Results"}
				</CardTitle>
				<CardDescription class="text-muted-foreground">
					You scored {form?.score || 0} out of {form?.total || 0} questions correctly ({form?.percentage ||
						0}%)
				</CardDescription>
				{#if testPassed}
					<Badge variant="default" class="mx-auto w-fit bg-green-600 text-white">
						Test Passed!
					</Badge>
				{:else}
					<Badge variant="destructive" class="mx-auto w-fit">Test Failed - Need 100% to Pass</Badge>
				{/if}
			</CardHeader>

			<CardContent class="space-y-6">
				{#if form?.message}
					<Alert.Root class="mb-4" variant={testPassed ? "default" : "destructive"}>
						<Alert.Title>{testPassed ? "Success!" : "Try Again"}</Alert.Title>
						<Alert.Description>{form.message}</Alert.Description>
					</Alert.Root>
				{/if}

				<div class="space-y-4">
					<h3 class="text-foreground text-lg font-semibold">Review Your Answers:</h3>

					{#if form?.results && data.questions}
						{#each form.results as result (result.questionId)}
							{@const question = data.questions.find((q) => q.id === result.questionId)}
							<Card class="border-border">
								<CardContent class="p-4">
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<p class="text-foreground mb-2 font-medium">
												Question {result.questionId}: {question?.question}
											</p>
											<div class="space-y-1 text-sm">
												<p class="text-muted-foreground">
													Your answer: <span
														class="font-medium {result.correct
															? 'text-green-600'
															: 'text-destructive'}">{question?.options[result.userAnswer]}</span
													>
												</p>
												{#if !result.correct}
													<p class="text-muted-foreground">
														Correct answer: <span class="font-medium text-green-600"
															>{question?.options[result.correctAnswer]}</span
														>
													</p>
												{/if}
												{#if question?.explanation}
													<p class="text-muted-foreground mt-2 italic">
														{question.explanation}
													</p>
												{/if}
											</div>
										</div>
										<div class="ml-4">
											{#if result.correct}
												<CheckCircle class="size-5 text-green-600" />
											{:else}
												<XCircle class="text-destructive size-5" />
											{/if}
										</div>
									</div>
								</CardContent>
							</Card>
						{/each}
					{/if}
				</div>

				<div class="flex flex-col justify-center gap-3 pt-6 sm:flex-row sm:gap-4">
					{#if testPassed}
						<Button onclick={navigateToDashboard} class="px-8">Continue to Dashboard</Button>
					{:else}
						<Button onclick={() => window.location.reload()} variant="outline" class="px-6">
							Take Test Again
						</Button>
					{/if}
					<a
						href="/dashboard"
						class="bg-muted text-muted-foreground hover:bg-muted/80 inline-flex items-center justify-center rounded-md px-6 py-2 text-sm font-medium"
					>
						Back to Dashboard
					</a>
				</div>
			</CardContent>
		</Card>
	{/if}

	<Dialog open={showPassDialog}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>🎉 You passed the test!</DialogTitle>
			</DialogHeader>
			<div class="space-y-4">
				<p class="text-muted-foreground">
					Congratulations! You have successfully passed the Island Beer Club test.
				</p>
				<div class="bg-muted rounded-md p-3">
					<p class="text-muted-foreground text-sm">
						An admin will review your profile and assign you a member number. After that, you’ll be
						able to create invitation links and use all member features.
					</p>
				</div>
			</div>
			<DialogFooter>
				<Button onclick={navigateToDashboard}>Continue to Dashboard</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</div>
