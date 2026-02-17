import { DataTypes, Model, Sequelize } from 'sequelize';

export type TResumeProjectHighlightModel = Model<{
  id: string;
  projectId: string;
  text: string;
  sortOrder: number;
}>;

const resumeProjectHighlightModel = (sequelize: Sequelize) => {
  const ResumeProjectHighlight = sequelize.define<TResumeProjectHighlightModel>(
    'ResumeProjectHighlight',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      projectId: {
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
      tableName: 'resume_project_highlights',
      timestamps: true,
      indexes: [{ fields: ['projectId'] }, { fields: ['projectId', 'sortOrder'] }],
    },
  );

  return ResumeProjectHighlight;
};

export default resumeProjectHighlightModel;

