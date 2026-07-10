export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    try {
        // Correctly structure the conversation history arrays for Gemini
        const contents = req.body.messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const response = await fetch(`https://googleapis.com`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({ contents })
        });
        
        const data = await response.json();
        
        if (data.error) {
            return res.status(400).json({ reply: `API Error: ${data.error.message}` });
        }

        // Deep extraction of Gemini's response text line
        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ reply: `Chat Engine Error: ${error.message}` });
    }
}
