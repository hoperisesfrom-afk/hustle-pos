import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://atydgofseradfblzrdbn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0eWRnb2ZzZXJhZGZibHpyZGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODc1NzgsImV4cCI6MjA5MzI2MzU3OH0.f9Slh4NyLDKDJ1nUQJ35GJDIKPZayhLyK9GFXSIihBc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
