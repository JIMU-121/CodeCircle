import express from 'express'; // Install via `npm install express`
import bodyParser from 'body-parser'; // Install via `npm install body-parser`
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Ensure environment variables are defined
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const app = express();
app.use(bodyParser.json()); // Parse incoming JSON requests

// POST endpoint to handle profile insertion
app.post('/insert-profile', async (req, res) => {
  try {
    const { record } = req.body;

    // Insert the profile data into the 'profiles' table
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: record.id,
        email: record.email,
        role: 'user',
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the Express server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
