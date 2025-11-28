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
        const currentPrice = recentHistory[recentHistory.length - 1]?.value || 0;

        const prompt = `
            You are a senior crypto market analyst. 
            Analyze this sequence of real-time Bitcoin (BTC/USD) prices: [${prices}].
            Current Price: $${currentPrice}.
            
            The user is running a high-frequency scalping bot (Alternator Strategy) on this live feed.
            
            Provide a JSON response with:
            1. sentiment: "bullish", "bearish", or "neutral" based on the immediate micro-trend.
            2. advice: A short, professional, yet witty 1-sentence trading signal or observation about the current volatility.
            3. confidence: A number between 0 and 100 representing confidence in the trend direction.
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