export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }

    // 👇 Replace with your real n8n webhook
    const n8nUrl = 'https://passiesport.app.n8n.cloud/webhook/generate-today-plan';

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text();
      throw new Error(`n8n webhook failed: ${n8nResponse.status} ${n8nResponse.statusText} - ${text}`);
    }

    const result = await n8nResponse.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in /api/generate-today-plan:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to generate today\'s plan', details: err.message }),
      { status: 500 }
    );
  }
}
