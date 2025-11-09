export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;  // Extract from frontend request
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Use the correct n8n URL (remove "-test" if it's not needed)
    const n8nUrl = 'https://passiesport.app.n8n.cloud/webhook/generate-today-plan';  // Or use webhookId: 'https://passiesport.app.n8n.cloud/webhook/638db8dc-7a20-4084-9cf6-655470cbed7b'
    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    // Check if n8n response is OK
    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();  // Get error details
      throw new Error(`n8n webhook failed: ${n8nResponse.status} ${n8nResponse.statusText} - ${errorText}`);
    }

    // Parse n8n response as JSON (assuming it returns JSON)
    const result = await n8nResponse.json();
    res.status(200).json(result);  // Return to frontend
  } catch (error) {
    console.error('Error in /api/generate-today-plan:', error);
    // Always return valid JSON on error
    res.status(500).json({ error: 'Failed to generate today\'s plan', details: error.message });
  }
}
