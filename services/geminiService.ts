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
        
        // Take the last 30 points
        const recentHistory = priceHistory.slice(-30);
        const prices = recentHistory.map(p => p.value.toFixed(2)).join(', ');
        const currentPrice = recentHistory[recentHistory.length - 1]?.value || 0;

        const prompt = `
            You are a Binary Options AI Assistant for Pocket Option.
            Analyze this live sequence of BTC/USD prices (1-second ticks): [${prices}].
            Current Price: $${currentPrice}.
            
            The user is looking for short-term reversals or momentum for 30-second to 1-minute expirations.
            
            Provide a JSON response:
            1. sentiment: "bullish" (CALL bias), "bearish" (PUT bias), or "neutral".
            2. advice: A VERY short, direct command for a binary trader (e.g., "Strong momentum, look for CALLs" or "Choppy market, avoid trading").
            3. confidence: 0-100.
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
            advice: 'Market analysis unavailable.',
            confidence: 0
        };
    }
};