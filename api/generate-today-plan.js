export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;  // From frontend
    const n8nResponse = await fetch('https://passiesport.app.n8n.cloud/webhook-test/generate-today-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n webhook failed: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

    const result = await n8nResponse.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/generate-today-plan:', error);
    res.status(500).json({ error: 'Failed to generate today\'s plan', details: error.message });
  }
}
