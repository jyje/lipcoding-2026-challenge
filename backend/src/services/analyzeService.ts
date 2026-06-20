import { prompt } from '@copilot-extensions/preview-sdk';

export interface Action {
  id: string;
  title: string;
  reason: string;
  priority: 1 | 2 | 3;
  estimateMin: number;
  done: boolean;
}

export interface AnalysisResult {
  summary: string;
  topActions: Action[];
  planBlocks: Array<{ title: string; duration: number; actions: Action[] }>;
  risks: string[];
  tag: {
    space: 'work' | 'career' | 'tech';
    careerSignals: string[];
    keywords: string[];
    confidence: number;
  };
}

export async function analyzeBrainDump(
  brainDump: string,
  timeBudgetMin: number = 120
): Promise<AnalysisResult> {
  const systemPrompt = `You are a productivity and planning assistant. Analyze the user's brain dump (unstructured thoughts, tasks, ideas, and concerns) and provide:

1. A concise summary (1-2 sentences)
2. Top 3-5 prioritized actions with:
   - Clear title
   - Reasoning for prioritization
   - Estimated time needed (in minutes)
   - Priority level (1=critical, 2=important, 3=nice-to-have)
3. Potential risks or blockers to address
4. Time blocks to organize the plan based on the given budget
5. Categorization (work/career/tech), career signals, and keywords

Respond in valid JSON format matching this schema:
{
  "summary": "string",
  "topActions": [
    {
      "id": "string",
      "title": "string",
      "reason": "string",
      "priority": 1 | 2 | 3,
      "estimateMin": number,
      "done": false
    }
  ],
  "planBlocks": [
    {
      "title": "string",
      "duration": number,
      "actions": [/* Action objects */]
    }
  ],
  "risks": ["string"],
  "tag": {
    "space": "work" | "career" | "tech",
    "careerSignals": ["string"],
    "keywords": ["string"],
    "confidence": 0.0 - 1.0
  }
}`;

  try {
    const result = await prompt(
      `Available time budget: ${timeBudgetMin} minutes\n\nBrain dump:\n${brainDump}`,
      {
        token: process.env.COPILOT_API_KEY || '',
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
        ],
      }
    );

    const content = result.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary || 'Analysis complete',
      topActions: parsed.topActions || [],
      planBlocks: parsed.planBlocks || [],
      risks: parsed.risks || [],
      tag: parsed.tag || {
        space: 'work',
        careerSignals: [],
        keywords: [],
        confidence: 0.5,
      },
    };
  } catch (error) {
    console.error('Error calling Copilot SDK:', error);
    throw new Error('Failed to analyze brain dump');
  }
}
