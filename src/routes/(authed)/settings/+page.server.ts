import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { superValidate, message, setError } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { hash, verify } from "argon2";
import { profileSchema, updatePasswordSchema } from "./settings-schema";
import { userWithoutPasswordHash } from "$lib/server/user-client";

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, "/login");
	}

	// Fetch complete user data from database to get all fields
	const [fullUser] = await db
		.select()
		.from(table.users)
		.where(eq(table.users.id, event.locals.user.id));

	if (!fullUser) {
		return redirect(302, "/login");
	}

	// Initialize the form with current user data
	const form = await superValidate(
		{
			name: fullUser.name,
			phone: fullUser.phone || "",
			address: fullUser.address || "",
			bio: fullUser.bio || "",
			hobbies: fullUser.hobbies || "",
			likes: fullUser.likes || ""
		},
		zod(profileSchema) // Use profileSchema for the form
	);
	// Initialize the update password form
	const updatePasswordForm = await superValidate(zod(updatePasswordSchema));

	return {
		user: userWithoutPasswordHash(fullUser),
		form,
		updatePasswordForm
	};
};

export const actions: Actions = {
	uploadImage: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: "Unauthorized" });
		}

		const formData = await event.request.formData();
		const image = formData.get("image") as File;

		if (!image || !image.size) {
			return fail(400, { message: "Please select an image to upload" });
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
		if (!allowedTypes.includes(image.type)) {
			return fail(400, { message: "Please upload a valid image file (JPG, PNG, or GIF)" });
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (image.size > maxSize) {
			return fail(400, { message: "Image must be smaller than 5MB" });
		}

		try {
			// Create uploads directory if it doesn't exist
			const uploadsDir = path.join(process.cwd(), "static/uploads");
			if (!existsSync(uploadsDir)) {
				await mkdir(uploadsDir, { recursive: true });
			}

			// Generate unique filename
			const extension = path.extname(image.name);
			const filename = `${event.locals.user.id}-${Date.now()}${extension}`;
			const filepath = path.join(uploadsDir, filename);

			// Save file
			const buffer = Buffer.from(await image.arrayBuffer());
			await writeFile(filepath, buffer);

			// Update user record in database
			const imagePath = `/uploads/${filename}`;
			await db
				.update(table.users)
				.set({ img: imagePath })
				.where(eq(table.users.id, event.locals.user.id));

			return {
				success: true,
				message: "Profile image updated successfully!"
			};
		} catch (error) {
			console.error("Error uploading image:", error);
			return fail(500, { message: "Failed to upload image. Please try again." });
		}
	},

	updateProfile: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: "Unauthorized" });
		}

		const form = await superValidate(event.request, zod(profileSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const set: Record<string, unknown> = {
				name: form.data.name,
				phone: form.data.phone,
				address: form.data.address,
				bio: form.data.bio,
				hobbies: form.data.hobbies,
				likes: form.data.likes,
				updated_at: new Date()
			};

			await db.update(table.users).set(set).where(eq(table.users.id, event.locals.user.id));

			return message(form, "Profile updated successfully!");
		} catch (error) {
			console.error("Error updating profile:", error);
			return message(form, "Failed to update profile. Please try again.", { status: 500 });
		}
	},
	updatePassword: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: "Unauthorized" });
		}

		const form = await superValidate(event.request, zod(updatePasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const user = await db.query.users.findFirst({
				where: eq(table.users.id, event.locals.user.id)
			});

			if (!user) {
				return fail(404, { form, message: "User not found" });
			}

			if (form.data.newPassword !== form.data.confirmPassword) {
				return fail(400, { form, message: "Passwords do not match" });
			}

			const stored = user.password_hash?.trim() ?? "";
			if (!stored.startsWith("$")) {
				return setError(
					form,
					"currentPassword",
					"Your account password cannot be updated here. Use the reset link from your email."
				);
			}
			const currentOk = await verify(stored, form.data.currentPassword);
			if (!currentOk) {
				return setError(form, "currentPassword", "Current password is incorrect.");
			}

			const passwordHash = await hash(form.data.newPassword);

			await db
				.update(table.users)
				.set({
					password_hash: passwordHash,
					updated_at: new Date()
				})
				.where(eq(table.users.id, event.locals.user.id));

			return message(form, "Password updated successfully!");
		} catch (error) {
			console.error("Error updating password:", error);
			return message(form, "Failed to update password. Please try again.", { status: 500 });
		}
	}
};
