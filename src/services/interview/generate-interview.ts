import { generateInterviewQA } from '@utils/dynamicInterview';

export const generateInterview = async <T>({
  rawText,
  requiredStack,
}: {
  rawText: string;
  requiredStack: string[];
}) => {
  const interview = await generateInterviewQA(rawText, requiredStack);
  return interview;
};
