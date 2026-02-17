import { DataTypes, Model, Sequelize } from 'sequelize';

export type TResumeExperienceModel = Model<{
  id: string;
  resumeId: string;
  company: string | null;
  title: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  sortOrder: number;
}>;

const resumeExperienceModel = (sequelize: Sequelize) => {
  const ResumeExperience = sequelize.define<TResumeExperienceModel>(
    'ResumeExperience',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      resumeId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      company: { type: DataTypes.TEXT, allowNull: true },
      title: { type: DataTypes.TEXT, allowNull: true },
      location: { type: DataTypes.TEXT, allowNull: true },
      startDate: { type: DataTypes.TEXT, allowNull: true },
      endDate: { type: DataTypes.TEXT, allowNull: true },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'resume_experience',
      timestamps: true,
      indexes: [{ fields: ['resumeId'] }, { fields: ['resumeId', 'sortOrder'] }],
    },
  );

  return ResumeExperience;
};

export default resumeExperienceModel;

