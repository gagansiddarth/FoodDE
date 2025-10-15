#!/bin/bash

# FoodDE Deployment Script

set -e

echo "FoodDE Deployment Script"
echo "======================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please copy env.example to .env and fill in your credentials."
    exit 1
fi

# Source environment variables
source .env

# Check required environment variables
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "Error: Missing required environment variables. Please check your .env file."
    echo "Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY"
    exit 1
fi

echo "Environment variables loaded successfully"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "Supabase CLI found"

# Login check (will prompt if not logged in)
echo "Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "Please login to Supabase:"
    supabase login
fi

echo "Supabase authenticated"

# Extract project ref from URL
PROJECT_REF=$(echo $VITE_SUPABASE_URL | sed 's/.*\/\/\(.*\)\.supabase\.co/\1/')
echo "Using project: $PROJECT_REF"

# Link to project
echo "Linking to Supabase project..."
supabase link --project-ref $PROJECT_REF

# Push database migrations
echo "Applying database migrations..."
supabase db push

# Deploy Edge Functions
echo "Deploying Edge Functions..."
supabase functions deploy analyze --verify-jwt false
supabase functions deploy chat --verify-jwt false

# Set Gemini API key as secret (if provided)
if [ ! -z "$GEMINI_API_KEY" ]; then
    echo "Setting Gemini API key..."
    echo $GEMINI_API_KEY | supabase secrets set GEMINI_API_KEY
else
    echo "Note: GEMINI_API_KEY not set. AI features may not work without it."
fi

echo "Deployment complete!"
echo ""
echo "Testing endpoints..."

# Test analyze endpoint
echo "Testing analyze function..."
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/analyze" \
  -H 'Content-Type: application/json' \
  -d '{"text": "sugar, wheat flour, palm oil, e102"}' | jq .

echo ""
echo "Testing chat function..."
curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/chat" \
  -H 'Content-Type: application/json' \
  -d '{"question": "Is E102 safe?", "context": {"health_score": 65, "flags": ["e102"]}}' | jq .

echo ""
echo "Deployment successful! FoodDE is ready to use."
echo "Frontend URL: $VITE_SUPABASE_URL"
echo "Functions URL: $VITE_SUPABASE_URL/functions/v1/"
