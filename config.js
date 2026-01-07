// --- CONFIGURACIÓN GLOBAL ---
const SUPABASE_URL = 'https://rtcbzfntsnxqvjvsekef.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Y2J6Zm50c254cXZqdnNla2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTc3MTQsImV4cCI6MjA3NjgzMzcxNH0.X1Cqd_eMquc39g4AXuLsKizHPeH94J6M7iSso0gVRsI';

// Creamos la variable global 'sbClient'
const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);