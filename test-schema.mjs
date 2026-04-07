import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
const env = {};
envStr.split('\n').filter(Boolean).forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim().replace(/['"]/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('users').select('mfa_secret').limit(1);
  if (error) console.log('ERROR:', error);
  else console.log('DATA:', data);
  process.exit(0);
}
test();
