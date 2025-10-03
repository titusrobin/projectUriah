// lib/openai.ts
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Please add your OpenAI API key to .env.local');
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function createAssistant(userEmail: string) {
  try {
    const assistant = await openai.beta.assistants.create({
      name: `Uriah Assistant for ${userEmail}`,
      instructions: `You are a personalized communication assistant for ${userEmail}. 
      You help draft campaigns, personalize messages, and manage inbox communications.
      Always maintain a professional yet friendly tone unless instructed otherwise.`,
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4-turbo-preview"
    });
    
    console.log("✅ Created assistant:", assistant.id);
    return assistant;
  } catch (error) {
    console.error("❌ Failed to create assistant:", error);
    throw error;
  }
}

export default openai;