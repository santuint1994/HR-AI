import { Interview, InterviewQuestion } from '@models/index';
import { normalizeRequiredStackKey } from './normalize-required-stack';

export interface InterviewWithQuestions {
  id: string;
  resumeId: string;
  requiredStack: string[];
  candidateSummary: string;
  experienceLevel: string;
  candidateSkills: string[];
  requiredSkills: string[];
  interviewQuestions: Array<{
    question: string;
    expectedAnswer: string;
    difficulty: string;
    category: string;
  }>;
}

export const findByResumeIdAndRequiredStack = async (
  resumeId: string,
  requiredTech: string | string[],
): Promise<InterviewWithQuestions | null> => {
  const requiredStackKey = normalizeRequiredStackKey(requiredTech);

  const interview = await Interview.findOne({
    where: { resumeId, requiredStackKey },
    include: [{ model: InterviewQuestion, as: 'questions' }],
  });

  if (!interview) return null;

  const interviewData = interview.get({ plain: true }) as Interview & {
    questions: Array<{ question: string; expectedAnswer: string; difficulty: string; category: string }>;
  };
  const questionsList = (interviewData.questions ?? []).sort(
    (a: any, b: any) =>
      new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
  );
  const questions = questionsList.map((q: any) => ({
    question: q.question,
    expectedAnswer: q.expectedAnswer,
    difficulty: q.difficulty,
    category: q.category,
  }));

  return {
    id: interviewData.id,
    resumeId: interviewData.resumeId,
    requiredStack: (interviewData.requiredStack as string[]) ?? [],
    candidateSummary: interviewData.candidateSummary ?? '',
    experienceLevel: interviewData.experienceLevel ?? '',
    candidateSkills: (interviewData.candidateSkills as string[]) ?? [],
    requiredSkills: (interviewData.requiredSkills as string[]) ?? [],
    interviewQuestions: questions,
  };
};
