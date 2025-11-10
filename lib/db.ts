import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tpkkwojypyuzsujizvqp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwa2t3b2p5cHl1enN1aml6dnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzU0MDMsImV4cCI6MjA3ODM1MTQwM30.SZ98FdHvxvIq7nKKJTb1pZz-JwIklYeBuvRgRnam6lc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
