/**
 * AI Service — Google Gemini
 * ──────────────────────────
 * Generates budget-optimized trip itineraries using Gemini 2.5 Flash.
 * Takes all aggregated travel data and produces a structured plan.
 */

const { GoogleGenAI } = require('@google/genai');
const env = require('../config/env');
const logger = require('../config/logger');

class AIService {
  constructor() {
    this.client = null;
    this.model = 'gemini-2.5-flash';
    if (env.geminiApiKey) {
      this.client = new GoogleGenAI({ apiKey: env.geminiApiKey });
    }
  }

  async generateItinerary(tripData) {
    if (!this.client) { logger.warn('Gemini not configured'); return this._fallbackItinerary(); }

    try {
      const prompt = this._buildPrompt(tripData);
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('AI response did not contain valid JSON');
        return this._fallbackItinerary();
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return this._validateAndNormalize(parsed);
    } catch (error) {
      logger.error('AI generation error:', error.message);
      return this._fallbackItinerary();
    }
  }

  _buildPrompt(data) {
    const { input, transport, hotels, places, weather } = data;
    const days = Math.ceil((new Date(input.endDate) - new Date(input.startDate)) / (1000*60*60*24));

    return `You are an expert travel planner AI. Create a detailed ${days}-day trip itinerary.

TRIP DETAILS:
- From: ${input.startLocation.name}
- To: ${input.destination.name}
- Dates: ${input.startDate} to ${input.endDate} (${days} days)
- Budget: ${input.budget.amount} ${input.budget.currency}
- Travelers: ${input.travelers}
- Style: ${input.preferences?.travelStyle || 'moderate'}

AVAILABLE TRANSPORT:
${transport.driving ? `- Driving: ${transport.driving.distance?.text}, ${transport.driving.duration?.text}, fuel ~${transport.driving.fuelEstimate?.costEstimate?.amount} INR` : ''}
${(transport.flights || []).slice(0,3).map(f => `- Flight: ${f.airline} ${f.flightNumber}, ${f.price.amount} ${f.price.currency}`).join('\n')}
${(transport.trains || []).slice(0,3).map(t => `- ${t.vehicle}: ${t.name}, ${t.price.low}-${t.price.high} ${t.price.currency}`).join('\n')}

AVAILABLE HOTELS (top 5):
${(hotels || []).slice(0,5).map(h => `- ${h.name}: ${h.price.perNight} ${h.price.currency}/night, ${h.starRating || 'N/A'} stars`).join('\n')}

ATTRACTIONS NEARBY:
${(places || []).slice(0,10).map(p => `- ${p.name} (${p.category})`).join('\n')}

WEATHER: ${weather?.summary || 'Not available'}

Respond with ONLY a JSON object in this exact structure:
{
  "summary": "Brief trip overview (2-3 sentences)",
  "budgetTiers": {
    "budget": { "dayWisePlan": [{"day":1,"date":"","title":"","activities":[{"time":"","activity":"","location":"","estimatedCost":0,"tips":""}],"meals":[{"type":"breakfast","suggestion":"","estimatedCost":0}],"transport":"","dailyCost":0}], "budgetBreakdown": {"transport":{"amount":0,"percentage":0},"accommodation":{"amount":0,"percentage":0},"food":{"amount":0,"percentage":0},"activities":{"amount":0,"percentage":0},"miscellaneous":{"amount":0,"percentage":0},"total":0,"currency":"${input.budget.currency}","withinBudget":true,"savings":0}, "totalCost": 0 },
    "moderate": { "dayWisePlan": [], "budgetBreakdown": {}, "totalCost": 0 },
    "premium": { "dayWisePlan": [], "budgetBreakdown": {}, "totalCost": 0 }
  },
  "recommendations": ["tip1", "tip2"],
  "tips": ["safety tip", "cultural tip"],
  "localFood": [{"name":"","description":"","priceRange":""}],
  "bestTransportOption": "Recommended transport with reasoning"
}

Make all 3 budget tiers complete with day-wise plans. Keep costs realistic. Currency: ${input.budget.currency}.`;
  }

  _validateAndNormalize(parsed) {
    return {
      summary: parsed.summary || '',
      budgetTiers: {
        budget: parsed.budgetTiers?.budget || { dayWisePlan: [], budgetBreakdown: {}, totalCost: 0 },
        moderate: parsed.budgetTiers?.moderate || { dayWisePlan: [], budgetBreakdown: {}, totalCost: 0 },
        premium: parsed.budgetTiers?.premium || { dayWisePlan: [], budgetBreakdown: {}, totalCost: 0 },
      },
      recommendations: parsed.recommendations || [],
      tips: parsed.tips || [],
      localFood: parsed.localFood || [],
      bestTransportOption: parsed.bestTransportOption || '',
    };
  }

  _fallbackItinerary() {
    return {
      summary: 'AI itinerary generation is currently unavailable. Please configure the Gemini API key.',
      budgetTiers: { budget: { dayWisePlan: [], budgetBreakdown: {}, totalCost: 0 }, moderate: { dayWisePlan: [], budgetBreakdown: {}, totalCost: 0 }, premium: { dayWisePlan: [], budgetBreakdown: {}, totalCost: 0 } },
      recommendations: [], tips: [], localFood: [], bestTransportOption: '',
    };
  }
}

module.exports = new AIService();
