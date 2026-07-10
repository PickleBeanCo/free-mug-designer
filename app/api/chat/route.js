import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { history, message } = await req.json();

    const systemInstruction = "You are a professional custom mug design assistant. Your goal is to discover what the user wants printed on their mug. Ask exactly one question at a time. First ask if they want Full Wrap or Single Graphic. Second, ask about the main subject matter. Third, ask if they want any text or a specific name included, reminding them to keep it short. Fourth, ask about the artistic style (e.g., watercolor, minimalist) and colours. Once you have all info, stop asking questions and reply exactly with the word: GENERATE followed by a highly descriptive image prompt detailing the layout, text, and styles. Speak only in plain friendly text conversation.";

    // Secure, error-proof history mapper
    const formattedContents = (history || []).map(item => {
      let textContent = "";
      if (item.parts && Array.isArray(item.parts) && item.parts[0]) {
        textContent = item.parts[0].text || "";
      } else if (item.parts && item.parts.text) {
        textContent = item.parts.text;
      } else {
        textContent = typeof item.parts === 'string' ? item.parts : "";
      }
      return {
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: textContent }]
      };
    });

    // Add the newest message
    formattedContents.push({
      role: 'user',
      parts: [{ text: message || "" }]
    });

    // Send direct network call to Google AI Studio
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
      const errorText = await response.text();
      return NextResponse.json({ error: `Google API rejected request: ${errorText}` }, { status: 400 });
    }

    const data = await response.json();
    
    // Safely pull text out of the official Google JSON structure
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const replyText = data.candidates[0].content.parts[0].text;
      return NextResponse.json({ reply: replyText });
    } else {
      return NextResponse.json({ error: "Empty or invalid response from Google API." }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ error: `Server Crash: ${error.message}` }, { status: 500 });
  }
}
