import { resumeRepository } from '@repositories/index';

export const searchCandidates = async (term: string, page: number, limit: number) => {
  // Cast to any to avoid tight coupling to repository function signature
  return (resumeRepository as any).searchResumes(term, page, limit);
};

