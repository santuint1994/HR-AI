import { DataTypes, Model, Sequelize } from 'sequelize';

export type TResumeProjectModel = Model<{
  id: string;
  resumeId: string;
  name: string | null;
  description: string | null;
  link: string | null;
  sortOrder: number;
}>;

const resumeProjectModel = (sequelize: Sequelize) => {
  const ResumeProject = sequelize.define<TResumeProjectModel>(
    'ResumeProject',
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
      name: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      link: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isUrlOrNull(value: unknown) {
            if (value === null || value === undefined || value === '') return;
            try {
              // eslint-disable-next-line no-new
              new URL(String(value));
            } catch {
              throw new Error('Project link must be a valid URL');
            }
          },
        } as any,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'resume_projects',
      timestamps: true,
      indexes: [{ fields: ['resumeId'] }, { fields: ['resumeId', 'sortOrder'] }],
    },
  );

  return ResumeProject;
};

export default resumeProjectModel;

