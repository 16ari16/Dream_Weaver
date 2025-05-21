// 'use server';

/**
 * @fileOverview Dream analysis AI agent.
 *
 * - analyzeDream - A function that handles the dream analysis process.
 * - AnalyzeDreamInput - The input type for the analyzeDream function.
 * - AnalyzeDreamOutput - The return type for the analyzeDream function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDreamInputSchema = z.object({
  dreamDetails: z.string().describe('The details of the dream.'),
  culturalContext: z
    .string()
    .optional()
    .describe('The cultural context of the dreamer.'),
});

export type AnalyzeDreamInput = z.infer<typeof AnalyzeDreamInputSchema>;

const AnalyzeDreamOutputSchema = z.object({
  interpretation: z.string().describe('The personalized interpretation of the dream in Russian.'),
});

export type AnalyzeDreamOutput = z.infer<typeof AnalyzeDreamOutputSchema>;

export async function analyzeDream(input: AnalyzeDreamInput): Promise<AnalyzeDreamOutput> {
  return analyzeDreamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDreamPrompt',
  input: {schema: AnalyzeDreamInputSchema},
  output: {schema: AnalyzeDreamOutputSchema},
  prompt: `Ты — аналитик сновидений, предоставляющий персонализированные интерпретации снов. Все ответы должны быть на русском языке.

  Учитывай следующие детали сна и культурный контекст (если предоставлен) для генерации уникальной, символической интерпретации.
  Детали сна: {{{dreamDetails}}}
  Культурный контекст: {{{culturalContext}}}

  Предоставь подробную и проницательную интерпретацию сна на русском языке, учитывая распространенные символы сновидений и возможные психологические инсайты.
  Интерпретация должна быть персонализированной и релевантной культурному фону сновидца.
  `,
});

const analyzeDreamFlow = ai.defineFlow(
  {
    name: 'analyzeDreamFlow',
    inputSchema: AnalyzeDreamInputSchema,
    outputSchema: AnalyzeDreamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
