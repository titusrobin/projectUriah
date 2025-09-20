import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createAssistant() {
  return await openai.beta.assistants.create({
    name: "Prototype Assistant",
    instructions: "testing v0",
    tools: [{ type: "code_interpreter" }]
  });
}
