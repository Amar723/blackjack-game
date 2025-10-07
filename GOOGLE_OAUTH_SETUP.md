# 🔐 Google OAuth Setup Guide

## Step-by-Step Google Authentication Setup

### 1. Create Google Cloud Project

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Click "Select a project" → "New Project"**
3. **Name your project** (e.g., "Blackjack Game")
4. **Click "Create"**

### 2. Enable Google APIs

1. **Go to "APIs & Services" → "Library"**
2. **Search for "Google+ API" or "Google Identity"**
3. **Click on it and "Enable"**

### 3. Create OAuth 2.0 Credentials

1. **Go to "APIs & Services" → "Credentials"**
2. **Click "Create Credentials" → "OAuth 2.0 Client ID"**
3. **Choose "Web application"**
4. **Name it** (e.g., "Blackjack Game Auth")
5. **Add Authorized redirect URIs:**
   ```
   https://your-supabase-project-id.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
6. **Click "Create"**
7. **Copy the Client ID and Client Secret**

### 4. Configure Supabase

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication → Providers**
3. **Find "Google" and click "Enable"**
4. **Enter your credentials:**
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. **Click "Save"**

### 5. Update Supabase URL Configuration

1. **Go to Authentication → URL Configuration**
2. **Set Site URL**: `http://localhost:3000`
3. **Add Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/game
   https://your-domain.com/auth/callback
   https://your-domain.com/game
   ```

### 6. Test the Configuration

1. **Start your app**: `npm run dev`
2. **Go to**: `http://localhost:3000/signin`
3. **Click "Sign in with Google"**
4. **You should be redirected to Google's OAuth page**

## Troubleshooting

### "Implicit grant connections are disabled"
- Make sure you're using OAuth 2.0 Client ID (not Service Account)
- Check that redirect URIs are correct
- Verify Google APIs are enabled

### "Redirect URI mismatch"
- Check that your redirect URIs in Google Cloud Console match exactly
- Make sure there are no trailing slashes
- Use HTTPS for production

### "Invalid client"
- Double-check your Client ID and Secret
- Make sure they're copied correctly (no extra spaces)
- Verify the OAuth consent screen is configured

### "Access blocked"
- Configure OAuth consent screen in Google Cloud Console
- Add your email as a test user
- Publish the app if needed

## Production Deployment

When deploying to production:

1. **Update redirect URIs** in Google Cloud Console:
   ```
   https://your-domain.com/auth/callback
   ```

2. **Update Supabase URL Configuration**:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`

3. **Update environment variables** in your hosting platform

## Common Issues

- **Development vs Production**: Use different redirect URIs for each
- **HTTPS Required**: Google OAuth requires HTTPS in production
- **Domain Verification**: You may need to verify your domain
- **Rate Limits**: Google has rate limits for OAuth requests

## Security Notes

- **Never commit** your Client Secret to version control
- **Use environment variables** for all sensitive data
- **Regularly rotate** your OAuth credentials
- **Monitor usage** in Google Cloud Console
