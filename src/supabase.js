import { createClient } from "@supabase/supabase-js";

// Use a custom domain as the supabase URL
const supabase = createClient(
  "https://estmeuzlefodsvxnntxu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdG1ldXpsZWZvZHN2eG5udHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODc5NzgsImV4cCI6MjA4NjU2Mzk3OH0.DZPv1IwBDPMaxs-MibQPcq06PmT3KxHK4-bA_orWQ-U",
);

export default supabase;
