-- Add additional profile fields for user information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age > 0 AND age < 150),
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update the existing profile policies to include the new fields
-- The existing policies should already work with the new fields since they're just additional columns
