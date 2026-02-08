export interface IResume {
  id: string;
  basics: object;
  skills: string[];
  languages: string[];
  certifications: object[];
  totalExperience: number;
  education: object[];
  experience: object[];
  projects: object[];
  raw?: string;
}
