import { Interview, InterviewQuestion } from '@models/index';
import { normalizeRequiredStackKey } from './normalize-required-stack';

export interface InterviewPayload {
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

export const createWithQuestions = async (
  resumeId: string,
  requiredStack: string[],
  payload: InterviewPayload,
): Promise<{
  id: string;
  resumeId: string;
  requiredStack: string[];
  candidateSummary: string;
  experienceLevel: string;
  candidateSkills: string[];
  requiredSkills: string[];
  interviewQuestions: InterviewPayload['interviewQuestions'];
}> => {
  const requiredStackKey = normalizeRequiredStackKey(requiredStack);

  const interviewInstance = await Interview.create({
    resumeId,
    requiredStack,
    requiredStackKey,
    candidateSummary: payload.candidateSummary,
    experienceLevel: payload.experienceLevel,
    candidateSkills: payload.candidateSkills,
    requiredSkills: payload.requiredSkills,
  });

  const interview = interviewInstance.get({ plain: true }) as {
    id: string;
    resumeId: string;
    requiredStack: string[];
    candidateSummary: string;
    experienceLevel: string;
    candidateSkills: string[];
    requiredSkills: string[];
  };

  const questionInstances = await InterviewQuestion.bulkCreate(
    payload.interviewQuestions.map((q) => ({
      interviewId: interview.id,
      question: q.question,
      expectedAnswer: q.expectedAnswer,
      difficulty: q.difficulty,
      category: q.category,
    })),
  );

  const interviewQuestions = questionInstances.map((q) => {
    const plain = q.get({ plain: true }) as {
      question: string;
      expectedAnswer: string;
      difficulty: string;
      category: string;
    };
    return {
      question: plain.question,
      expectedAnswer: plain.expectedAnswer,
      difficulty: plain.difficulty,
      category: plain.category,
    };
  });

  return {
    id: interview.id,
    resumeId: interview.resumeId,
    requiredStack: interview.requiredStack ?? [],
    candidateSummary: interview.candidateSummary,
    experienceLevel: interview.experienceLevel,
    candidateSkills: interview.candidateSkills ?? [],
    requiredSkills: interview.requiredSkills ?? [],
    interviewQuestions,
  };
};
