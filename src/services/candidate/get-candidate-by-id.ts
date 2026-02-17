import { resumeRepository } from '@repositories/index';

export const getCandidateById = async (id: string) => {
  return resumeRepository.getResumeById(id);
};

