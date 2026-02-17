import { DataTypes, Model, Sequelize } from 'sequelize';

export type TResumeSkillModel = Model<{
  id: string;
  resumeId: string;
  name: string;
  sortOrder: number;
}>;

const resumeSkillModel = (sequelize: Sequelize) => {
  const ResumeSkill = sequelize.define<TResumeSkillModel>(
    'ResumeSkill',
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
      tableName: 'resume_skills',
      timestamps: true,
      indexes: [{ fields: ['resumeId'] }, { fields: ['resumeId', 'sortOrder'] }],
    },
  );

  return ResumeSkill;
};

export default resumeSkillModel;

