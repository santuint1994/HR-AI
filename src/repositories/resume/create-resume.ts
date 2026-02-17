import { sequelize } from '@config/database/sql';
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
import { IResume } from 'types';

export const createResume = async (body: IResume) => {
  return sequelize.transaction(async (transaction) => {
    const resume = await Resume.create(
      {
        totalExperience: body.totalExperience ?? 0,
        raw: body.raw ?? null,
      } as any,
      { transaction },
    );

    await ResumeBasics.create(
      {
        resumeId: resume.get('id'),
        fullName: body.basics?.fullName ?? null,
        headline: body.basics?.headline ?? null,
        email: body.basics?.email ?? null,
        phone: body.basics?.phone ?? null,
        location: body.basics?.location ?? null,
        summary: body.basics?.summary ?? null,
      } as any,
      { transaction },
    );

    const links = (body.basics?.links ?? []).map((l, idx) => ({
      resumeId: resume.get('id'),
      label: l.label ?? null,
      url: l.url,
      sortOrder: idx,
    }));
    if (links.length) await ResumeLink.bulkCreate(links as any, { transaction });

    const skills = (body.skills ?? []).map((name, idx) => ({
      resumeId: resume.get('id'),
      name,
      sortOrder: idx,
    }));
    if (skills.length) await ResumeSkill.bulkCreate(skills as any, { transaction });

    const languages = (body.languages ?? []).map((name, idx) => ({
      resumeId: resume.get('id'),
      name,
      sortOrder: idx,
    }));
    if (languages.length) await ResumeLanguage.bulkCreate(languages as any, { transaction });

    const certifications = (body.certifications ?? []).map((c, idx) => ({
      resumeId: resume.get('id'),
      name: c.name,
      issuer: c.issuer ?? null,
      date: c.date ?? null,
      sortOrder: idx,
    }));
    if (certifications.length)
      await ResumeCertification.bulkCreate(certifications as any, { transaction });

    const education = (body.education ?? []).map((e, idx) => ({
      resumeId: resume.get('id'),
      institution: e.institution ?? null,
      degree: e.degree ?? null,
      field: e.field ?? null,
      startDate: e.startDate ?? null,
      endDate: e.endDate ?? null,
      location: e.location ?? null,
      details: e.details ?? null,
      sortOrder: idx,
    }));
    if (education.length) await ResumeEducation.bulkCreate(education as any, { transaction });

    for (let i = 0; i < (body.experience ?? []).length; i++) {
      const e = body.experience[i];
      const exp = await ResumeExperience.create(
        {
          resumeId: resume.get('id'),
          company: e.company ?? null,
          title: e.title ?? null,
          location: e.location ?? null,
          startDate: e.startDate ?? null,
          endDate: e.endDate ?? null,
          sortOrder: i,
        } as any,
        { transaction },
      );

      const highlights = (e.highlights ?? []).map((text, idx) => ({
        experienceId: exp.get('id'),
        text,
        sortOrder: idx,
      }));
      if (highlights.length)
        await ResumeExperienceHighlight.bulkCreate(highlights as any, { transaction });
    }

    for (let i = 0; i < (body.projects ?? []).length; i++) {
      const p = body.projects[i];
      const project = await ResumeProject.create(
        {
          resumeId: resume.get('id'),
          name: p.name ?? null,
          description: p.description ?? null,
          link: p.link ?? null,
          sortOrder: i,
        } as any,
        { transaction },
      );

      const highlights = (p.highlights ?? []).map((text, idx) => ({
        projectId: project.get('id'),
        text,
        sortOrder: idx,
      }));
      if (highlights.length)
        await ResumeProjectHighlight.bulkCreate(highlights as any, { transaction });
    }

    return resume;
  });
};
