export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const promptText = req.body.prompt;
        const isWrap = promptText.toLowerCase().includes('wrap');
        
        // Match sizing rules for mug spaces (Widescreen landscape vs 1:1 Square)
        const width = isWrap ? 1200 : 1000;
        const height = isWrap ? 600 : 1000;

        // Clean up characters so the web address doesn't break
        const cleanPrompt = encodeURIComponent(`${promptText}, graphic design print asset for custom coffee mug, text centered, solid white background background, sharp details`);
        
        // Generate an instant free high-resolution URL
        const imageUrl = `https://pollinations.ai{cleanPrompt}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 100000)}&nologo=true`;

        return res.status(200).json({ url: imageUrl });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
