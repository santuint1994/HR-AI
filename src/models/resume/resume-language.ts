import { DataTypes, Model, Sequelize } from 'sequelize';

export type TResumeLanguageModel = Model<{
  id: string;
  resumeId: string;
  name: string;
  sortOrder: number;
}>;

const resumeLanguageModel = (sequelize: Sequelize) => {
  const ResumeLanguage = sequelize.define<TResumeLanguageModel>(
    'ResumeLanguage',
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
      name: {
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
      tableName: 'resume_languages',
      timestamps: true,
      indexes: [{ fields: ['resumeId'] }, { fields: ['resumeId', 'sortOrder'] }],
    },
  );

  return ResumeLanguage;
};

export default resumeLanguageModel;

