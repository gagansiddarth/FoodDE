// Database Diagnostic Script
// Run this in your browser console to diagnose the database issue

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = "https://troqkvnbdmovkxbthqan.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyb3Frdm5iZG1vdmt4YnRocWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2OTEyNzcsImV4cCI6MjA3NDI2NzI3N30.-eqfHwhYBu6289Vtvh-blIUH_-33biFLvuldaoNei00";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function diagnoseDatabase() {
  console.log('🔍 Starting database diagnosis...');
  
  // Test 1: Check authentication
  console.log('\n1. Testing authentication...');
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error('❌ Auth error:', authError);
  } else if (!session) {
    console.log('⚠️  No active session - user needs to log in');
  } else {
    console.log('✅ User authenticated:', session.user.email);
  }
  
  // Test 2: Check if profiles table exists
  console.log('\n2. Testing profiles table...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Profiles table error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
    } else {
      console.log('✅ Profiles table exists');
    }
  } catch (err) {
    console.error('❌ Exception testing profiles table:', err);
  }
  
  // Test 3: Check if scans table exists
  console.log('\n3. Testing scans table...');
  try {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Scans table error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    } else {
      console.log('✅ Scans table exists');
    }
  } catch (err) {
    console.error('❌ Exception testing scans table:', err);
  }
  
  // Test 4: Try to create a test profile (if authenticated)
  if (session?.user) {
    console.log('\n4. Testing profile creation...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          full_name: 'Test User',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Profile creation error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
      } else {
        console.log('✅ Profile creation successful:', data);
      }
    } catch (err) {
      console.error('❌ Exception creating profile:', err);
    }
  }
  
  console.log('\n🏁 Diagnosis complete. Check the results above.');
}

// Run the diagnosis
diagnoseDatabase();
