import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hpunlrlvtkjifskigkca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwdW5scmx2dGtqaWZza2lna2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTA1MjUsImV4cCI6MjA4NzAyNjUyNX0.3NFU26JT1MewrjrxkSzd01HQoxk0MoFP_hnbn9ddhN8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
