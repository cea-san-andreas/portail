import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zifadrbwfynjnycgkgpw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZmFkcmJ3Znluam55Y2drZ3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTcxOTEsImV4cCI6MjA4OTg3MzE5MX0.bCKC4bh_GfXU4O-EcB0XQLPz81mxkAu7InAxm31blvQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
