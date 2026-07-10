import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { history, message } = await req.json();

    // Explicitly initialize the SDK with your private Vercel environment variable
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = "You are a professional custom mug design assistant. Your goal is to discover what the user wants printed on their mug. Ask exactly one question at a time. First ask if they want Full Wrap or Single Graphic. Second, ask about the main subject matter. Third, ask if they want any text or a specific name included, reminding them to keep it short. Fourth, ask about the artistic style (e.g., watercolor, minimalist) and colours. Once you have all info, stop asking questions and reply exactly with the word: GENERATE followed by a highly descriptive image prompt detailing the layout, text, and styles. Speak only in plain friendly text conversation.";

    // Map conversation log into the precise roles required by the modern SDK
    const formattedContents = history.map(item => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.parts[0].text }]
    }));

    // Append the new incoming user text payload
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call the content generation model via the unified engine mapping rules
    const responseResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = responseResult.text;

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("NextJS Server Route Crash Exception Log:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
