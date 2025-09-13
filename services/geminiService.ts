
import { GoogleGenAI } from "@google/genai";
import { GeneratedContent, Topic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateContentForTopic(topic: Topic): Promise<GeneratedContent> {
  try {
    const model = 'gemini-2.5-flash';
    const explanationPrompt = `
      Provide a clear and concise explanation for "${topic.title}" in the context of Python programming. 
      Cover the following:
      1.  What is it? (A brief, easy-to-understand definition).
      2.  How does it work? (A step-by-step explanation for algorithms, or key characteristics for data structures).
      3.  Time and Space Complexity (Big O notation).
      4.  Common use cases or when it's a good choice.
      Format the output in markdown. Use headings, bullet points, and bold text for clarity.
    `;

    const codePrompt = `
      Generate a clean, well-commented, and idiomatic Python implementation of "${topic.title}".
      - The code should be self-contained and easy to understand.
      - For algorithms, provide a simple example of how to use it.
      - For data structures, implement the core operations (e.g., insert, delete, search).
      - Do not include any explanation, just the Python code block.
    `;

    const [explanationResponse, codeResponse] = await Promise.all([
      ai.models.generateContent({ model, contents: explanationPrompt }),
      ai.models.generateContent({ model, contents: codePrompt }),
    ]);

    const explanation = explanationResponse.text.trim();
    
    let pythonCode = codeResponse.text.trim();
    if (pythonCode.startsWith('```python')) {
        pythonCode = pythonCode.substring(9);
    }
    if (pythonCode.endsWith('```')) {
        pythonCode = pythonCode.substring(0, pythonCode.length - 3);
    }
    pythonCode = pythonCode.trim();

    return {
      explanation,
      pythonCode,
    };
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    return {
      explanation: "Failed to load explanation. Please check your API key and network connection.",
      pythonCode: "# Failed to load Python code.",
    };
  }
}
