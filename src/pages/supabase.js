import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const SUPABASE_URL = YOUR_SUPABASE_URL;
const SUPABASE_KEY = YOUR_SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// console.log(supabase);

export { SUPABASE_URL, SUPABASE_KEY, supabase };