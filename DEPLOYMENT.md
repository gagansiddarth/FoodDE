# FoodDE Deployment Guide

This guide covers deploying FoodDE to production environments.

## Prerequisites

- **Supabase CLI** installed globally
- **Google Gemini API Key** for AI features
- **Supabase Project** for backend services

## Environment Setup

1. **Copy environment template**
   ```bash
   cp env.example .env
   ```

2. **Configure environment variables**
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Supabase Configuration

1. **Login to Supabase**
   ```bash
   supabase login
   ```

2. **Link to your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Apply database migrations**
   ```bash
   supabase db push
   ```

## Deploy Edge Functions

1. **Deploy analyze function**
   ```bash
   supabase functions deploy analyze
   ```

2. **Deploy chat function**
   ```bash
   supabase functions deploy chat
   ```

3. **Set API key secret**
   ```bash
   supabase secrets set GEMINI_API_KEY=your-gemini-api-key
   ```

## Frontend Deployment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Deploy to your hosting platform**

## Deployment Options

### Vercel
- Connect your GitHub repository
- Vercel will automatically build and deploy
- Set environment variables in Vercel dashboard

### Netlify
- Drag and drop the `dist` folder
- Or connect your repository for automatic deployments
- Configure environment variables in site settings

### Supabase Hosting
- Use Supabase's integrated hosting solution
- Automatic deployment from your repository
- Built-in environment variable management

## Verification

Test your deployment by:
1. Checking the main application loads
2. Testing ingredient analysis functionality
3. Verifying AI chat responses
4. Confirming user authentication works

## Troubleshooting

### Common Issues

**Edge Functions Not Working**
- Check function logs: `supabase functions logs analyze`
- Verify secrets are set: `supabase secrets list`

**CORS Errors**
Add these headers to your Edge Functions:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**Environment Variables**
- Frontend: Use `VITE_` prefix for client-side variables
- Edge Functions: Use `Deno.env.get()` for server-side variables
- Never expose API keys in frontend code

## Production Checklist

- [ ] Gemini API key configured in Supabase secrets
- [ ] Database migrations applied
- [ ] Edge functions deployed and tested
- [ ] Frontend environment variables configured
- [ ] CORS headers configured if needed
- [ ] Rate limiting implemented (recommended)

## Security Considerations

- Keep API keys in server-side environment only
- Use Supabase RLS policies for data protection
- Implement rate limiting for production traffic
- Monitor API usage and costs regularly

## Cost Optimization

- Monitor Gemini API usage and implement caching
- Use appropriate Supabase plan for your traffic
- Consider implementing request throttling
