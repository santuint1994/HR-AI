import type { Sequelize } from 'sequelize';

// Parent
import resumeModel, { resumeBasicsModel } from './resume';

// Children (normalized)
import resumeLinkModel from './resume/resume-link';
import resumeSkillModel from './resume/resume-skill';
import resumeLanguageModel from './resume/resume-language';
import resumeCertificationModel from './resume/resume-certification';
import resumeEducationModel from './resume/resume-education';
import resumeExperienceModel from './resume/resume-experience';
import resumeExperienceHighlightModel from './resume/resume-experience-highlight';
import resumeProjectModel from './resume/resume-project';
import resumeProjectHighlightModel from './resume/resume-project-highlight';
import userModel from './user';
import interviewModel from './interview';
import interviewQuestionModel from './interview/interview-question';

export let Resume: ReturnType<typeof resumeModel>;
export let ResumeBasics: ReturnType<typeof resumeBasicsModel>;
export let ResumeLink: ReturnType<typeof resumeLinkModel>;
export let ResumeSkill: ReturnType<typeof resumeSkillModel>;
export let ResumeLanguage: ReturnType<typeof resumeLanguageModel>;
export let ResumeCertification: ReturnType<typeof resumeCertificationModel>;
export let ResumeEducation: ReturnType<typeof resumeEducationModel>;
export let ResumeExperience: ReturnType<typeof resumeExperienceModel>;
export let ResumeExperienceHighlight: ReturnType<typeof resumeExperienceHighlightModel>;
export let ResumeProject: ReturnType<typeof resumeProjectModel>;
export let ResumeProjectHighlight: ReturnType<typeof resumeProjectHighlightModel>;
export let User: ReturnType<typeof userModel>;
export let Interview: ReturnType<typeof interviewModel>;
export let InterviewQuestion: ReturnType<typeof interviewQuestionModel>;

export const initModels = (sequelize: Sequelize) => {
  // Initialize
  Resume = resumeModel(sequelize);
  ResumeBasics = resumeBasicsModel(sequelize);
  ResumeLink = resumeLinkModel(sequelize);
  ResumeSkill = resumeSkillModel(sequelize);
  ResumeLanguage = resumeLanguageModel(sequelize);
  ResumeCertification = resumeCertificationModel(sequelize);
  ResumeEducation = resumeEducationModel(sequelize);
  ResumeExperience = resumeExperienceModel(sequelize);
  ResumeExperienceHighlight = resumeExperienceHighlightModel(sequelize);
  ResumeProject = resumeProjectModel(sequelize);
  ResumeProjectHighlight = resumeProjectHighlightModel(sequelize);
  User = userModel(sequelize);
  Interview = interviewModel(sequelize);
  InterviewQuestion = interviewQuestionModel(sequelize);

  /* =====================================================
     📌 Associations
     ===================================================== */
  Resume.hasOne(ResumeBasics, {
    foreignKey: 'resumeId',
    as: 'basics',
    onDelete: 'CASCADE',
    hooks: true,
  });
  ResumeBasics.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Resume.hasMany(ResumeLink, {
    foreignKey: 'resumeId',
    as: 'links',
    onDelete: 'CASCADE',
    hooks: true,
  });
  ResumeLink.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Resume.hasMany(ResumeSkill, {
    foreignKey: 'resumeId',
    as: 'skills',
    onDelete: 'CASCADE',
    hooks: true,
  });
  ResumeSkill.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Resume.hasMany(ResumeLanguage, {
    foreignKey: 'resumeId',
    as: 'languages',
    onDelete: 'CASCADE',
    hooks: true,
  });
  ResumeLanguage.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Resume.hasMany(ResumeCertification, {
    foreignKey: 'resumeId',
    as: 'certifications',
    onDelete: 'CASCADE',
    hooks: true,
  });
  ResumeCertification.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Resume.hasMany(ResumeEducation, {
    foreignKey: 'resumeId',
    as: 'education',
    onDelete: 'CASCADE',
    hooks: true,
  });
  ResumeEducation.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Resume.hasMany(ResumeExperience, {
    foreignKey: 'resumeId',
    as: 'experience',
    onDelete: 'CASCADE',
    hooks: true,
  });
  ResumeExperience.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  ResumeExperience.hasMany(ResumeExperienceHighlight, {
    foreignKey: 'experienceId',
    as: 'highlights',
    onDelete: 'CASCADE',
    hooks: true,
  });
  ResumeExperienceHighlight.belongsTo(ResumeExperience, {
    foreignKey: 'experienceId',
    as: 'experience',
  });

  Resume.hasMany(ResumeProject, {
    foreignKey: 'resumeId',
    as: 'projects',
    onDelete: 'CASCADE',
    hooks: true,
  });
  ResumeProject.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  ResumeProject.hasMany(ResumeProjectHighlight, {
    foreignKey: 'projectId',
    as: 'highlights',
    onDelete: 'CASCADE',
    hooks: true,
  });
  ResumeProjectHighlight.belongsTo(ResumeProject, { foreignKey: 'projectId', as: 'project' });

  Resume.hasMany(Interview, {
    foreignKey: 'resumeId',
    as: 'interviews',
    onDelete: 'CASCADE',
    hooks: true,
  });
  Interview.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Interview.hasMany(InterviewQuestion, {
    foreignKey: 'interviewId',
    as: 'questions',
    onDelete: 'CASCADE',
    hooks: true,
  });
  InterviewQuestion.belongsTo(Interview, { foreignKey: 'interviewId', as: 'interview' });
};

