// Check Environment Variables
// Run with: node check-env.js

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Environment Variables...');
console.log('');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_GEMINI_API_KEY'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allPresent = false;
  }
});

console.log('');

if (allPresent) {
  console.log('✅ All environment variables are present!');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Make sure Google OAuth is enabled in Supabase');
  console.log('2. Configure Google OAuth credentials in Supabase');
  console.log('3. Set up redirect URLs correctly');
  console.log('4. Run: npm run dev');
} else {
  console.log('❌ Some environment variables are missing!');
  console.log('Please check your .env.local file.');
}
