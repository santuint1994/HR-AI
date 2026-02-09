import Joi from 'joi';

export const InterviewSchema = Joi.object({
  candidateSummary: Joi.string().required(),

  experienceLevel: Joi.string().required(),

  candidateSkills: Joi.array().items(Joi.string().required()).required(),

  requiredSkills: Joi.array().items(Joi.string().required()).required(),

  interviewQuestions: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().required(),
        expectedAnswer: Joi.string().required(),
        difficulty: Joi.string().required(),
        category: Joi.string().required(),
      }),
    )
    .required(),
});
