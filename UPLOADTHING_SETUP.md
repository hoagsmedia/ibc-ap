# UploadThing Setup Guide

This guide explains how to set up UploadThing for the Island Beer Club application.

## Overview

The application uses UploadThing for cloud-based image storage with two separate uploaders:

- **Profile Image Uploader**: Single images for user avatars (4MB max)
- **Gallery Image Uploader**: Multiple images for events and galleries (8MB max, 10 files)

## Setup Steps

### 1. Create UploadThing Account

1. Go to [uploadthing.com](https://uploadthing.com)
2. Sign up for an account
3. Create a new application

### 2. Get API Token

1. In your UploadThing dashboard, go to API Keys
2. Copy your secret token
3. Add it to your environment variables:

```bash
# Add to .env file
UPLOADTHING_TOKEN="your_secret_token_here"
```

### 3. Configure Route Handlers

The application is already configured with:

- `/src/lib/server/uploadthing.ts` - File router configuration
- `/src/routes/api/uploadthing/+server.ts` - API endpoint
- `/src/lib/utils.ts` - Client-side helpers

### 4. Environment Variables

Copy `.env.example` to `.env` and add your UploadThing token:

```bash
cp .env.example .env
# Edit .env and add your UPLOADTHING_TOKEN
```

## Current Features

### Profile Image Upload

- Location: `/settings` page
- Automatically updates user profile in database
- Supports JPG, PNG, GIF up to 4MB
- Integrated with Lucia authentication

### Gallery Image Upload

- Ready for implementation in gallery/events features
- Supports multiple files up to 8MB each
- Maximum 10 files per upload

## Image Handling

The application handles both legacy local images and new UploadThing URLs:

```svelte
{#if user.img}
	{#if user.img.startsWith('http')}
		<!-- UploadThing URL -->
		<img src={user.img} alt={user.name} />
	{:else}
		<!-- Legacy local file path -->
		<img src={`/resources/${user.img}`} alt={user.name} />
	{/if}
{/if}
```

## Migration Script

### Profile Image Migration

A migration script exists to upload existing profile images from `/static/resources/` to UploadThing:

```bash
# Run the migration (requires UPLOADTHING_TOKEN)
npx tsx scripts/migrate-simple.ts
```

The script will:

1. Find all profile images in `/static/resources/`
2. Upload them to UploadThing
3. Update user records with new URLs
4. Skip files without member numbers

### Prerequisites for Migration

- UploadThing account and token configured
- Development server running (for authentication)
- Database access for updating user records

## Testing

### Test Profile Upload

1. Start the development server: `npm run dev`
2. Log in as a user
3. Go to `/settings`
4. Try uploading a profile image
5. Verify the image appears in the layout navigation

### Verify Database Updates

Check that the `users.img` field contains the UploadThing URL (starts with `https://uploadthing.com/`).

## Troubleshooting

### Upload Fails

- Verify `UPLOADTHING_TOKEN` is set correctly
- Check file size limits (4MB for profiles, 8MB for gallery)
- Ensure user is authenticated

### Migration Issues

- Confirm all environment variables are set
- Check that image files exist in `/static/resources/`
- Verify database connection and user MBR numbers

### Authentication Errors

- Ensure Lucia auth is working properly
- Check session cookies in browser
- Verify user permissions

## File Structure

```
src/
├── lib/
│   ├── server/
│   │   └── uploadthing.ts          # File router config
│   └── utils.ts                    # Client helpers
├── routes/
│   ├── api/
│   │   └── uploadthing/
│   │       └── +server.ts          # API endpoint
│   └── (authed)/
│       └── settings/
│           ├── +page.svelte        # Profile upload UI
│           └── +page.server.ts     # Server actions
└── scripts/
    ├── migrate-simple.ts           # Migration script
    └── migrate-profile-images.ts   # Alternative migration
```

## Next Steps

1. Set up UploadThing account and get token
2. Test profile image uploads on settings page
3. Run migration script to move existing images
4. Implement gallery image uploads for events
5. Clean up old local image handling code
