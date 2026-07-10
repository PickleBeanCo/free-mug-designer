export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    try {
        // Map standard chat roles into the format Google Gemini expects
        const contents = req.body.messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const response = await fetch(`https://googleapis.com{process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });
        
        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
