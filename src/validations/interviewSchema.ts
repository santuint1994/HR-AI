import Joi from 'joi';

/** Request body for POST /generate-interview */
export const GenerateInterviewSchema = Joi.object({
  resumeId: Joi.string().uuid().required(),
  requiredTech: Joi.alternatives()
    .try(
      Joi.string().min(1),
      Joi.array().items(Joi.string().min(1)).min(1),
    )
    .required(),
});

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
