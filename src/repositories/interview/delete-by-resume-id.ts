import { Interview } from '@models/index';

/**
 * Delete all interviews (and their questions via cascade) for a resume.
 */
export const deleteByResumeId = async (resumeId: string): Promise<number> => {
  const deleted = await Interview.destroy({ where: { resumeId } });
  return deleted;
};
