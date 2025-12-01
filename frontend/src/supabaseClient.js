import { createClient } from "@supabase/supabase-js";

// These variables are read from the environment (loaded from your .env file locally)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing. Check your .env file and ensure you restarted your server."
  );
} else {
  // Log successful initialization
  console.log("Supabase Client Initialized successfully.");
}

// Initialize and export the client. Any component (like Login.jsx) imports this 'supabase' object.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
