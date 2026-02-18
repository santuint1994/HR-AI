import { generateInterviewQA } from '@utils/dynamicInterview';
import { interviewRepository, resumeRepository } from '@repositories/index';
import { StatusError } from '@config/error/status-error';

export interface GenerateInterviewInput {
  resumeId: string;
  requiredTech: string | string[];
}

export interface GenerateInterviewResult {
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

export const generateInterview = async (
  input: GenerateInterviewInput,
): Promise<GenerateInterviewResult> => {
  const { resumeId, requiredTech } = input;
  const requiredStack = interviewRepository.parseRequiredStack(requiredTech);

  // 1. Check if we already have an interview for this resumeId + requiredStack in DB
  const existing = await interviewRepository.findByResumeIdAndRequiredStack(resumeId, requiredTech);
  if (existing) {
    return {
      candidateSummary: existing.candidateSummary,
      experienceLevel: existing.experienceLevel,
      candidateSkills: existing.candidateSkills,
      requiredSkills: existing.requiredSkills,
      interviewQuestions: existing.interviewQuestions,
    };
  }

  // 2. Get resume raw text for generation
  const resume = await resumeRepository.getResumeById(resumeId);
  if (!resume) {
    throw StatusError.notFound('Resume not found');
  }
  const rawText = resume.raw ?? '';
  if (!rawText.trim()) {
    throw StatusError.badRequest('Resume has no raw text for interview generation');
  }

  // 3. Delete any existing interviews for this resume (then create fresh with new stack)
  await interviewRepository.deleteByResumeId(resumeId);

  // 4. Generate new interview via LLM
  const generated = await generateInterviewQA(rawText, requiredStack);

  // 5. Save to DB and return
  const saved = await interviewRepository.createWithQuestions(resumeId, requiredStack, {
    candidateSummary: generated.candidateSummary,
    experienceLevel: generated.experienceLevel,
    candidateSkills: generated.candidateSkills,
    requiredSkills: generated.requiredSkills,
    interviewQuestions: generated.interviewQuestions,
  });

  return {
    candidateSummary: saved.candidateSummary,
    experienceLevel: saved.experienceLevel,
    candidateSkills: saved.candidateSkills,
    requiredSkills: saved.requiredSkills,
    interviewQuestions: saved.interviewQuestions,
  };
};
