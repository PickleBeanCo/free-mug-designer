import { GoogleGenAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { history, message } = await req.json();

    // Securely pull the key on the server side where users can never see it
    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = "You are a professional custom mug design assistant. Your goal is to discover what the user wants printed on their mug. Ask exactly one question at a time. First ask if they want Full Wrap or Single Graphic. Second, ask about the main subject matter. Third, ask if they want any text or a specific name included, reminding them to keep it short. Fourth, ask about the artistic style (e.g., watercolor, minimalist) and colours. Once you have all info, stop asking questions and reply exactly with the word: GENERATE followed by a highly descriptive image prompt detailing the layout, text, and styles. Speak only in plain friendly text conversation.";

    // Format the past logs cleanly for Gemini's server structure
    const pastHistory = history.map(item => ({
      role: item.role,
      parts: [{ text: item.parts[0].text }]
    }));

    const chat = model.startChat({
      history: pastHistory,
    });

    const finalPromptText = `[System Instructions: ${systemInstruction}]\n\nUser Message: ${message}`;
    const responseResult = await chat.sendMessage(finalPromptText);
    const replyText = responseResult.response.text();

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Backend Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
