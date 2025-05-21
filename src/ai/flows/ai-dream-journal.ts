'use server';

/**
 * @fileOverview An AI agent that tags and categorizes dreams in Russian.
 *
 * - aiDreamJournal - A function that handles the dream tagging and categorization process.
 * - AiDreamJournalInput - The input type for the aiDreamJournal function.
 * - AiDreamJournalOutput - The return type for the aiDreamJournal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDreamJournalInputSchema = z.object({
  dreamText: z
    .string()
    .describe('The text of the dream to be analyzed and tagged.'),
});
export type AiDreamJournalInput = z.infer<typeof AiDreamJournalInputSchema>;

const AiDreamJournalOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('An array of tags that categorize the dream in Russian.'),
  category: z
    .string()
    .describe('The primary category that the dream belongs to in Russian.'),
  summary: z
    .string()
    .describe('A brief summary of the dream in Russian.'),
});
export type AiDreamJournalOutput = z.infer<typeof AiDreamJournalOutputSchema>;

export async function aiDreamJournal(input: AiDreamJournalInput): Promise<AiDreamJournalOutput> {
  return aiDreamJournalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDreamJournalPrompt',
  input: {schema: AiDreamJournalInputSchema},
  output: {schema: AiDreamJournalOutputSchema},
  prompt: `Ты — ИИ-интерпретатор снов. Проанализируй предоставленный текст сна и предоставь теги, категорию и краткое резюме. Все ответы должны быть на русском языке.

Текст сна: {{{dreamText}}}

Проанализируй сон и предоставь следующее на русском языке:

- tags: Массив релевантных тегов для сна.
- category: Основная категория, к которой относится сон.
- summary: Краткое резюме сна.

Убедись, что ответ хорошо отформатирован и легок для понимания.`,
});

const aiDreamJournalFlow = ai.defineFlow(
  {
    name: 'aiDreamJournalFlow',
    inputSchema: AiDreamJournalInputSchema,
    outputSchema: AiDreamJournalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
