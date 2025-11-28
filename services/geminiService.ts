import { GoogleGenAI, Type } from "@google/genai";
import { MarketAnalysis, PricePoint } from "../types";

const parseMarketAnalysis = (text: string): MarketAnalysis => {
    try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText) as MarketAnalysis;
    } catch (e) {
        console.error("Failed to parse Gemini response", e);
        return {
            sentiment: 'neutral',
            advice: 'Unable to analyze market conditions at this moment.',
            confidence: 0
        };
    }
};

export const analyzeMarketTrends = async (priceHistory: PricePoint[]): Promise<MarketAnalysis> => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return {
                sentiment: 'neutral',
                advice: 'API Key missing. Cannot perform AI analysis.',
                confidence: 0
            };
        }

        const ai = new GoogleGenAI({ apiKey });
        
        // Take the last 30 points to avoid token limits and focus on recent trends
        const recentHistory = priceHistory.slice(-30);
        const prices = recentHistory.map(p => p.value.toFixed(2)).join(', ');

        const prompt = `
            You are a high-frequency trading analyst. Analyze this sequence of stock prices: [${prices}].
            The strategy currently running is a simple alternator (Buy then Sell every X seconds).
            
            Provide a JSON response with:
            1. sentiment: "bullish", "bearish", or "neutral" based on the trend.
            2. advice: A short, witty 1-sentence comment on whether the "Alternator Bot" is likely to make money in this specific micro-trend.
            3. confidence: A number between 0 and 100 representing confidence in the trend.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: { type: Type.STRING, enum: ["bullish", "bearish", "neutral"] },
                        advice: { type: Type.STRING },
                        confidence: { type: Type.INTEGER }
                    }
                }
            }
        });

        if (response.text) {
            return parseMarketAnalysis(response.text);
        }
        
        throw new Error("No response text");

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            sentiment: 'neutral',
            advice: 'Market analysis unavailable (AI Connection Error).',
            confidence: 0
        };
    }
};