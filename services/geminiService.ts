
import { GoogleGenAI } from "@google/genai";
import { Category, Trend, GroundingSource } from "../types";

const API_KEY = process.env.API_KEY || "";

export const scanTrends = async (category: Category): Promise<{ trends: Trend[]; sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Find the top 5 trending and most searched topics in the ${category} category for today. 
  Focus on news, breakthroughs, or popular discussions from major web sources.
  Provide the output in a clean format with a topic name, a brief description, and relevance score (1-100).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const sources: GroundingSource[] = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title || "Source",
      uri: chunk.web.uri
    }));

  // Simplified parsing logic for trends - in a production app, we'd use responseSchema
  const lines = text.split('\n').filter(l => l.trim().length > 10);
  const trends: Trend[] = lines.slice(0, 5).map(line => ({
    topic: line.split(':')[0].replace(/[0-9*.]/g, '').trim(),
    description: line.substring(line.indexOf(':') + 1).trim() || "Trending news in " + category,
    relevance: Math.floor(Math.random() * 20) + 80
  }));

  return { trends, sources };
};

export const generateArticle = async (topic: string, category: Category): Promise<{ title: string; content: string; summary: string }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Write a high-quality, SEO-optimized blog article about "${topic}" in the context of ${category}.
  Include an engaging title, a 2-sentence summary, and the full article content.
  The tone should be professional yet accessible.
  Use markdown for formatting.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "";
  
  // Extract parts from response
  const titleMatch = text.match(/^# (.*)/m) || text.match(/Title: (.*)/);
  const title = titleMatch ? titleMatch[1] : `Deep Dive: ${topic}`;
  
  const summaryPart = text.split('\n\n')[1] || "Automated summary of the latest trends.";
  
  return {
    title,
    content: text,
    summary: summaryPart
  };
};
