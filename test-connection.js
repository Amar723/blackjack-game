// Test Supabase Connection
// Run with: node test-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables!');
  console.log('Please create .env.local file with your Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔄 Testing connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('💡 Make sure your Supabase project is active and database is set up.');
    } else {
      console.log('✅ Supabase connection successful!');
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    console.log('💡 Check your Supabase URL and key.');
  }
}

testConnection();
