import { resumeRepository } from '@repositories/index';
import { IResume } from 'types';

export const createParseCv = async (body: IResume) => {
    const resume = await resumeRepository.createResume(body);
    return resume;
};
