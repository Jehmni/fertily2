// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fgbhxuvdobmkqojfmboa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnYmh4dXZkb2Jta3FvamZtYm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNzE4NzIsImV4cCI6MjA1Mzg0Nzg3Mn0.1oCLHiM1UcC0qn2eif1tv54r_TBGyoqbC6y2pqC_dkk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);