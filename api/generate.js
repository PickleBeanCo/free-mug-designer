export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const promptText = req.body.prompt;
        const isWrap = promptText.toLowerCase().includes('wrap');
        const aspect_ratio = isWrap ? "16:9" : "1:1";

        // Force strict formatting instructions onto Gemini for readable mug layouts
        const structuredPrompt = `Create a professional product graphic print design for a custom coffee mug. 
        Aspect ratio ${aspect_ratio}. 
        Any requested text or wording must be spelled perfectly, centered, and rendered in a clean, legible font with high contrast. 
        Style: flat vector art style, isolated on a completely plain, solid white background, sharp edges, no realistic mockups, no 3D mug shadows. 
        Design details: ${promptText}`;

        const response = await fetch(`https://googleapis.com{process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: structuredPrompt }]
                }]
            })
        });

        const data = await response.json();
        const rawBase64 = data.candidates[0].content.parts[0].inlineData.data; 
        const formattedUrl = `data:image/jpeg;base64,${rawBase64}`;

        return res.status(200).json({ url: formattedUrl });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
