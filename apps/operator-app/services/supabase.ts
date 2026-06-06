import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://etplzdnzfrqgofrizzyh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cGx6ZG56ZnJxZ29mcml6enloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Njc4NTcsImV4cCI6MjA5NTU0Mzg1N30.bFAxue1Pkx0_14rmS91sgn8mAAOi_f39LnQAR1Rr-wc"
);