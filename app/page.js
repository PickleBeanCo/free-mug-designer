'use client';
import { useState, useEffect, useRef } from 'react';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  const chatEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Hello! I'm your custom mug designer!. Do you want a 'Full Wrap' design that covers the whole mug, or a 'Single Graphic' on just one side?" }
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const triggerInputSubmit = () => {
    if (loading) return;
    const textNode = document.getElementById('final-mug-input-box');
    const val = textNode ? textNode.value.trim() : '';
    if (!val) return;
    
    executeChatWorkflow(val);
  };

  const executeChatWorkflow = async (userText) => {
    setInput('');
    const inputField = document.getElementById('final-mug-input-box');
    if (inputField) inputField.value = '';

    const updatedHistory = [...chatHistory, { role: "user", content: userText }];
    setChatHistory(updatedHistory);
    setLoading(true);

    try {
      const systemContext = "You are a professional custom mug design assistant. Your goal is to discover what the user wants printed on their mug. Ask exactly one question at a time. First ask if they want Full Wrap or Single Graphic. Second, ask about the main subject matter. Third, ask if they want any text or a specific name included, reminding them to keep it short. Fourth, ask about the artistic style (e.g., watercolor, minimalist) and colours. Once you have all info, stop asking questions and reply exactly with the word: GENERATE followed by a highly descriptive image prompt detailing the layout, text, and styles. Speak only in normal, friendly conversational text.";
      
      const conversationLog = updatedHistory.map(m => (m.role === 'user' ? 'Customer' : 'Designer') + ': ' + m.content).join('\n');
      const finalPromptBlock = systemContext + '\n\nHere is the ongoing chat history so far:\n' + conversationLog + '\n\nDesigner response:';

      const randomCacheBuster = Math.floor(Math.random() * 999999);
      
      // FIXED USING STANDARD STRING CONCATENATION TO ELIMINATE BACKTICK BUGS
      const secureCleanUrl = "https://pollinations.ai" + encodeURIComponent(finalPromptBlock) + "?model=mistral&cb=" + randomCacheBuster;
      
      const response = await fetch(secureCleanUrl);
      if (!response.ok) throw new Error("Connection Interrupted");
      const reply = await response.text();

      if (reply.toUpperCase().includes('GENERATE')) {
        setChatHistory(prev => [...prev, { role: "assistant", content: "Perfect! Drawing your print image now... please wait a few seconds." }]);
        const promptText = reply.replace(/generate/i, '').trim();
        const isWrap = promptText.toLowerCase().includes('wrap');
        const cleanPrompt = encodeURIComponent(promptText + ", clean vector print asset for custom coffee mug, text typography centered, solid plain white background, sharp edges");
        
        const width = isWrap ? 1200 : 1000;
        const height = isWrap ? 600 : 1000;
        const seed = Math.floor(Math.random() * 100000);
        
        // FIXED IMAGE URL SEGMENTS
        const generatedUrl = "https://pollinations.ai" + cleanPrompt + "?width=" + width + "&height=" + height + "&seed=" + seed + "&nologo=true";
        setImageUrl(generatedUrl);
      } else {
        setChatHistory(prev => [...prev, { role: "assistant", content: reply.trim() }]);
      }
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: "assistant", content: "Connection lagged. Please try typing your last message response again!" }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '500px', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ color: '#333' }}>☕ AI Mug Designer</h2>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div style={{ width: '100%', maxWidth: '500px', height: '400px', background: 'white', borderRadius: '8px', border: '1px solid #ddd', overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', marginBottom: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        {chatHistory.map((m, idx) => (
          <div key={idx} style={{ margin: '8px 0', padding: '10px 14px', borderRadius: '8px', maxWidth: '80%', wordWrap: 'break-word', fontSize: '15px', lineHeight: '1.4', background: m.role === 'user' ? '#0070f3' : '#e5e5ea', color: m.role === 'user' ? 'white' : 'black', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: 'flex', width: '100%', maxWidth: '500px' }}>
        <input 
          id="final-mug-input-box"
          style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px' }} 
          type="text" 
          defaultValue=""
          onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); triggerInputSubmit(); } }} 
          placeholder={loading ? "AI is typing..." : "Type your answer here..."} 
          disabled={loading} 
        />
        <button 
          style={{ padding: '12px 24px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', marginLeft: '5px', cursor: 'pointer', fontWeight: 'bold' }} 
          onClick={triggerInputSubmit} 
          disabled={loading}
        >
          Send
        </button>
      </div>

      {imageUrl && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
          <img src={imageUrl} alt="Mug Graphic" style={{ width: '100%', borderRadius: '8px', border: '2px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
          <a href={imageUrl} download="mug-design.jpg" target="_blank" rel="noreferrer" style={{ marginTop: '12px', padding: '12px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', width: '100%', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box', boxShadow: '0 4px 6px rgba(16,185,129,0.2)' }}>Download Print File</a>
        </div>
      )}
    </div>
  );
}
