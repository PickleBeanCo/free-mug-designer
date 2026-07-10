export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    try {
        // Map roles correctly. System prompts go inside user contents for simple endpoints
        const contents = req.body.messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        // Use the explicit x-goog-api-key header format for Vercel
        const response = await fetch(`https://googleapis.com`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({ contents })
        });
        
        const data = await response.json();
        
        // Error trap: If Google passes a system error message, throw it
        if (data.error) {
            return res.status(400).json({ reply: `API Error: ${data.error.message}` });
        }

        // Exact deep data array index required for the raw JSON return
        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ reply: `Server Error: ${error.message}. Check your Vercel Environment variables.` });
    }
}
