export type ResumeLink = {
  label: string | null;
  url: string;
};

export type ResumeBasics = {
  fullName: string | null;
  headline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  links: ResumeLink[];
};

export type ResumeCertification = {
  name: string;
  issuer: string | null;
  date: string | null;
};

export type ResumeEducation = {
  institution: string | null;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  details: string | null;
};

export type ResumeExperience = {
  company: string | null;
  title: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  highlights: string[];
};

export type ResumeProject = {
  name: string | null;
  description: string | null;
  link: string | null;
  highlights: string[];
};

export interface IResume {
  id: string;
  basics: ResumeBasics;
  skills: string[];
  languages: string[];
  certifications: ResumeCertification[];
  totalExperience: number;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  raw?: string;
}
