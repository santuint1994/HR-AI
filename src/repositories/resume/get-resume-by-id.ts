import {
  Resume,
  ResumeBasics,
  ResumeCertification,
  ResumeEducation,
  ResumeExperience,
  ResumeExperienceHighlight,
  ResumeLanguage,
  ResumeLink,
  ResumeProject,
  ResumeProjectHighlight,
  ResumeSkill,
} from '@models/index';
import { ResumeJSON } from '@validations/resumeSchema';

export const getResumeById = async (id: string): Promise<ResumeJSON | null> => {
  const resume = await Resume.findByPk(id, {
    include: [
      { model: ResumeBasics, as: 'basics' },
      { model: ResumeLink, as: 'links', separate: true, order: [['sortOrder', 'ASC']] },
      { model: ResumeSkill, as: 'skills', separate: true, order: [['sortOrder', 'ASC']] },
      { model: ResumeLanguage, as: 'languages', separate: true, order: [['sortOrder', 'ASC']] },
      {
        model: ResumeCertification,
        as: 'certifications',
        separate: true,
        order: [['sortOrder', 'ASC']],
      },
      { model: ResumeEducation, as: 'education', separate: true, order: [['sortOrder', 'ASC']] },
      {
        model: ResumeExperience,
        as: 'experience',
        separate: true,
        order: [['sortOrder', 'ASC']],
        include: [
          {
            model: ResumeExperienceHighlight,
            as: 'highlights',
            separate: true,
            order: [['sortOrder', 'ASC']],
          },
        ],
      },
      {
        model: ResumeProject,
        as: 'projects',
        separate: true,
        order: [['sortOrder', 'ASC']],
        include: [
          {
            model: ResumeProjectHighlight,
            as: 'highlights',
            separate: true,
            order: [['sortOrder', 'ASC']],
          },
        ],
      },
    ],
  });

  if (!resume) return null;

  const basics = (resume as any).basics;
  const links = ((resume as any).links ?? []).map((l: any) => ({
    label: l.label,
    url: l.url,
  }));

  const skills = ((resume as any).skills ?? []).map((s: any) => s.name);
  const languages = ((resume as any).languages ?? []).map((l: any) => l.name);

  const certifications = ((resume as any).certifications ?? []).map((c: any) => ({
    name: c.name,
    issuer: c.issuer,
    date: c.date,
  }));

  const education = ((resume as any).education ?? []).map((e: any) => ({
    institution: e.institution,
    degree: e.degree,
    field: e.field,
    startDate: e.startDate,
    endDate: e.endDate,
    location: e.location,
    details: e.details,
  }));

  const experience = ((resume as any).experience ?? []).map((e: any) => ({
    company: e.company,
    title: e.title,
    location: e.location,
    startDate: e.startDate,
    endDate: e.endDate,
    highlights: (e.highlights ?? []).map((h: any) => h.text),
  }));

  const projects = ((resume as any).projects ?? []).map((p: any) => ({
    name: p.name,
    description: p.description,
    link: p.link,
    highlights: (p.highlights ?? []).map((h: any) => h.text),
  }));

  return {
    basics: {
      fullName: basics?.fullName ?? null,
      headline: basics?.headline ?? null,
      email: basics?.email ?? null,
      phone: basics?.phone ?? null,
      location: basics?.location ?? null,
      summary: basics?.summary ?? null,
      links,
    },
    skills,
    languages,
    certifications,
    totalExperience: (resume.get('totalExperience') as number) ?? 0,
    education,
    experience,
    projects,
    raw: (resume.get('raw') as string | null) ?? undefined,
  };
};

