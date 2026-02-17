import { DataTypes, Model, Sequelize } from 'sequelize';

export type TResumeExperienceHighlightModel = Model<{
  id: string;
  experienceId: string;
  text: string;
  sortOrder: number;
}>;

const resumeExperienceHighlightModel = (sequelize: Sequelize) => {
  const ResumeExperienceHighlight = sequelize.define<TResumeExperienceHighlightModel>(
    'ResumeExperienceHighlight',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      experienceId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'resume_experience_highlights',
      timestamps: true,
      indexes: [{ fields: ['experienceId'] }, { fields: ['experienceId', 'sortOrder'] }],
    },
  );

  return ResumeExperienceHighlight;
};

export default resumeExperienceHighlightModel;

