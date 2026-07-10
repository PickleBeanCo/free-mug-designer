import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { history, message } = await req.json();

    // 1. Safeguard system instruction for the AI model mapping
    const systemInstruction = "You are a professional custom mug design assistant. Your goal is to discover what the user wants printed on their mug. Ask exactly one question at a time. First ask if they want Full Wrap or Single Graphic. Second, ask about the main subject matter. Third, ask if they want any text or a specific name included, reminding them to keep it short. Fourth, ask about the artistic style (e.g., watercolor, minimalist) and colours. Once you have all info, stop asking questions and reply exactly with the word: GENERATE followed by a highly descriptive image prompt detailing the layout, text, and styles. Speak only in plain friendly text conversation.";

    // 2. Cleanly map running logs into the exact raw content JSON template Google requires
    const formattedContents = history.map(item => {
      let textContent = "";
      if (item.parts && Array.isArray(item.parts) && item.parts[0]) {
        textContent = item.parts[0].text || "";
      } else if (item.parts && item.parts.text) {
        textContent = item.parts.text;
      } else {
        textContent = typeof m.parts === 'string' ? m.parts : "";
      }
      return {
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: textContent }]
      };
    });

    // 3. Add the latest user text string to the array block
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // 4. Run a direct HTTP network post to Google AI Studio's public endpoint
    const response = await fetch(`https://googleapis.com{process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Google API connection refused.");
    }

    const data = await response.json();
    
    // 5. Extract the raw assistant text line directly from the nested payload array
    const replyText = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Secure Server Endpoint Exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
