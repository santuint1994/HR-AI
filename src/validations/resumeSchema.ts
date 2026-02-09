import Joi from 'joi';

// Reusable
const nullableString = Joi.string().allow(null);

export const LinkSchema = Joi.object({
  label: nullableString,
  url: Joi.string().min(1).required(),
});

export const ResumeSchema = Joi.object({
  basics: Joi.object({
    fullName: nullableString,
    headline: nullableString,
    email: nullableString,
    phone: nullableString,
    location: nullableString,
    summary: nullableString,
    links: Joi.array().items(LinkSchema).default([]),
  }).required(),

  skills: Joi.array().items(Joi.string()).default([]),
  languages: Joi.array().items(Joi.string()).default([]),

  certifications: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(1).required(),
        issuer: nullableString,
        date: nullableString,
      }),
    )
    .default([]),

  education: Joi.array()
    .items(
      Joi.object({
        institution: nullableString,
        degree: nullableString,
        field: nullableString,
        startDate: nullableString,
        endDate: nullableString,
        location: nullableString,
        details: nullableString,
      }),
    )
    .default([]),
  totalExperience: Joi.number().default(0),
  experience: Joi.array()
    .items(
      Joi.object({
        company: nullableString,
        title: nullableString,
        location: nullableString,
        startDate: nullableString,
        endDate: nullableString,
        highlights: Joi.array().items(Joi.string()).default([]),
      }),
    )
    .default([]),

  projects: Joi.array()
    .items(
      Joi.object({
        name: nullableString,
        description: nullableString,
        link: nullableString,
        highlights: Joi.array().items(Joi.string()).default([]),
      }),
    )
    .default([]),

  raw: Joi.string().optional(),
})
  // keep behavior close to zod: allow extra keys unless you want to forbid them
  .unknown(true);

export type ResumeJSON = {
  basics: {
    fullName: string | null;
    headline: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    summary: string | null;
    links: { label: string | null; url: string }[];
  };
  skills: string[];
  languages: string[];
  certifications: { name: string; issuer: string | null; date: string | null }[];
  totalExperience: number;
  education: {
    institution: string | null;
    degree: string | null;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    location: string | null;
    details: string | null;
  }[];
  experience: {
    company: string | null;
    title: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    highlights: string[];
  }[];
  projects: {
    name: string | null;
    description: string | null;
    link: string | null;
    highlights: string[];
  }[];
  raw?: string;
};
