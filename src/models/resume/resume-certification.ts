import { DataTypes, Model, Sequelize } from 'sequelize';

export type TResumeCertificationModel = Model<{
  id: string;
  resumeId: string;
  name: string;
  issuer: string | null;
  date: string | null;
  sortOrder: number;
}>;

const resumeCertificationModel = (sequelize: Sequelize) => {
  const ResumeCertification = sequelize.define<TResumeCertificationModel>(
    'ResumeCertification',
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
      issuer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      date: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'resume_certifications',
      timestamps: true,
      indexes: [{ fields: ['resumeId'] }, { fields: ['resumeId', 'sortOrder'] }],
    },
  );

  return ResumeCertification;
};

export default resumeCertificationModel;

