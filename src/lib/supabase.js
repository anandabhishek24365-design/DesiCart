import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vkttohdxfgrgbhlfxcun.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdHRvaGR4ZmdyZ2JobGZ4Y3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNDY1MjUsImV4cCI6MjEwNDcyMjUyNX0.RXu0BG3ZUWa1wG7d6qXNfUo9NmqWSvH4ikkiGLhf_Ag';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
