import { resumeRepository } from '@repositories/index';

export const listCandidates = async () => {
  return resumeRepository.listResumes();
};

