import { DataTypes, Model, Sequelize } from 'sequelize';

export type TResumeLinkModel = Model<{
  id: string;
  resumeId: string;
  label: string | null;
  url: string;
  sortOrder: number;
}>;

const resumeLinkModel = (sequelize: Sequelize) => {
  const ResumeLink = sequelize.define<TResumeLinkModel>(
    'ResumeLink',
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
      label: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          isUrl: true,
        },
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'resume_links',
      timestamps: true,
      indexes: [{ fields: ['resumeId'] }, { fields: ['resumeId', 'sortOrder'] }],
    },
  );

  return ResumeLink;
};

export default resumeLinkModel;

