import { IResume } from 'types';
import { Resume } from '@models/index';

export const createResume = async (body: IResume): Promise<IResume> => {
  const resumeDetails = await Resume.create(body);
  return resumeDetails;
};
