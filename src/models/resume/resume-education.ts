import { DataTypes, Model, Sequelize } from 'sequelize';

export type TResumeEducationModel = Model<{
  id: string;
  resumeId: string;
  institution: string | null;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  details: string | null;
  sortOrder: number;
}>;

const resumeEducationModel = (sequelize: Sequelize) => {
  const ResumeEducation = sequelize.define<TResumeEducationModel>(
    'ResumeEducation',
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
      institution: { type: DataTypes.TEXT, allowNull: true },
      degree: { type: DataTypes.TEXT, allowNull: true },
      field: { type: DataTypes.TEXT, allowNull: true },
      startDate: { type: DataTypes.TEXT, allowNull: true },
      endDate: { type: DataTypes.TEXT, allowNull: true },
      location: { type: DataTypes.TEXT, allowNull: true },
      details: { type: DataTypes.TEXT, allowNull: true },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'resume_education',
      timestamps: true,
      indexes: [{ fields: ['resumeId'] }, { fields: ['resumeId', 'sortOrder'] }],
    },
  );

  return ResumeEducation;
};

export default resumeEducationModel;

