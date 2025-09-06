import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { filename, fileContent } = req.body;

    if (!filename || !fileContent) {
      return res.status(400).json({ error: 'Missing filename or fileContent' });
    }

    // Convert base64 file to Buffer
    const buffer = Buffer.from(fileContent, 'base64');

    // Upload to storage bucket "tests"
    const { error: uploadError } = await supabase.storage
      .from('tests')
      .upload(filename, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Insert into "files" table
    const { error: dbError } = await supabase
      .from('files')
      .insert([{ name: filename, path: filename }]);

    if (dbError) {
      throw dbError;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
