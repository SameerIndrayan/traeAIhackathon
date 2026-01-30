
import { NextResponse } from 'next/server';

const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.MINIMAX_API_KEY;

    if (!apiKey) {
      console.warn("Missing MINIMAX_API_KEY, using mock response");
      return NextResponse.json(getMockResponse(prompt));
    }

    const systemPrompt = `
You are a "Butterfly Effect" Divergence Engine for a financial simulator.
Your goal is to analyze a "What If" historical scenario and determine its economic impact on a company's financials.

Input: A user's "What If" scenario (e.g., "What if the 2008 crash happened in 2010?").

Output: A JSON object with the following fields:
- sentiment: A short description of the market sentiment (e.g., "Panic selling ensues...").
- divergenceScore: A number between 0 and 100 indicating how much history changed.
- revenueMultiplier: A number (e.g., 0.8 for 20% drop, 1.2 for 20% gain).
- expenseMultiplier: A number (e.g., 1.1 for 10% increase in costs).

Return ONLY valid JSON.
    `;

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "abab5.5-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        stream: false,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MiniMax API Error:", errorText);
      throw new Error(`MiniMax API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from content (handle potential markdown blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    } else {
      throw new Error("Failed to parse JSON from AI response");
    }

  } catch (error: any) {
    console.error("Simulation Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

function getMockResponse(prompt: string) {
  const lower = prompt.toLowerCase();
  
  // Specific Scenario: Competitor Launch
  if (lower.includes("competitor") || lower.includes("rival")) {
    return {
      sentiment: "A major competitor launches a free alternative. Churn spikes as customers test the new option.",
      divergenceScore: 65,
      revenueMultiplier: 0.75, // 25% drop in sales
      expenseMultiplier: 1.1, // Higher marketing spend to fight back
    };
  }

  // Specific Scenario: Viral Marketing
  if (lower.includes("viral") || lower.includes("campaign")) {
    return {
      sentiment: "Your latest ad campaign goes viral on TikTok. Inbound leads overwhelm the sales team.",
      divergenceScore: 80,
      revenueMultiplier: 1.5, // 50% increase in sales
      expenseMultiplier: 1.05, // Slight increase in server costs
    };
  }

  // Specific Scenario: Server Outage
  if (lower.includes("outage") || lower.includes("hack") || lower.includes("breach")) {
    return {
      sentiment: "A critical security breach forces a 3-day total shutdown. Trust is damaged.",
      divergenceScore: 90,
      revenueMultiplier: 0.6, // Significant revenue loss
      expenseMultiplier: 1.4, // Massive emergency fix costs
    };
  }

  // Specific Scenario: Funding Round
  if (lower.includes("funding") || lower.includes("investment") || lower.includes("vc")) {
    return {
      sentiment: "You successfully close a Series A round. Capital is available for aggressive expansion.",
      divergenceScore: 50,
      revenueMultiplier: 1.1, // Slow growth initially
      expenseMultiplier: 1.5, // Hiring spree begins
    };
  }
  
  // Specific Scenario: Apple 1997
  if (lower.includes("apple") || lower.includes("1997")) {
    return {
      sentiment: "Without Jobs' return, Apple fails to innovate. The iMac G3 never launches, and Microsoft dominates the OS market completely.",
      divergenceScore: 95,
      revenueMultiplier: 0.3, // Massive revenue drop
      expenseMultiplier: 1.2, // Higher restructuring costs
    };
  }

  // Specific Scenario: Tesla IPO Fail
  if (lower.includes("tesla") || lower.includes("ipo")) {
    return {
      sentiment: "Tesla fails to raise capital in 2010. EV adoption is delayed by a decade as legacy auto remains complacent.",
      divergenceScore: 88,
      revenueMultiplier: 0.1, // Near bankruptcy
      expenseMultiplier: 0.8, // Operations shrink
    };
  }
  
  if (lower.includes("crash") || lower.includes("crisis") || lower.includes("fail")) {
    return {
      sentiment: "Market panic triggers a liquidity freeze. Investors flee to safe havens.",
      divergenceScore: 85,
      revenueMultiplier: 0.6,
      expenseMultiplier: 1.1
    };
  }
  
  if (lower.includes("boom") || lower.includes("success") || lower.includes("rally")) {
    return {
      sentiment: "Irrational exuberance takes hold. Capital flows freely into risky assets.",
      divergenceScore: 70,
      revenueMultiplier: 1.4,
      expenseMultiplier: 1.2
    };
  }

  return {
    sentiment: "The market reacts with mild volatility but stabilizes quickly.",
    divergenceScore: 20,
    revenueMultiplier: 0.95,
    expenseMultiplier: 0.98
  };
}
