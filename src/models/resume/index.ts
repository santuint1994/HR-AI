import { DataTypes, Model, Sequelize } from 'sequelize';
import { IResume } from 'types';

/**
 * IMPORTANT: Do not add nested fields here.
 * `resumes` table only stores top-level metadata.
 * Nested fields live in child tables like `resume_basics`, `resume_skills`, etc.
 */
type TResumeAttributes = Pick<IResume, 'id' | 'totalExperience' | 'raw'>;
type TResumeCreationAttributes = Partial<TResumeAttributes>;
export type TResumeModel = Model<TResumeAttributes, TResumeCreationAttributes> & TResumeAttributes;

export type TResumeBasicsModel = Model<{
  id: string;
  resumeId: string;
  fullName: string | null;
  headline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
}>;

const resumeModel = (sequelize: Sequelize) => {
  const Resume = sequelize.define<TResumeModel>(
    'Resume',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      totalExperience: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      raw: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'resumes',
      timestamps: true,
    },
  );

  return Resume;
};

export const resumeBasicsModel = (sequelize: Sequelize) => {
  const ResumeBasics = sequelize.define<TResumeBasicsModel>(
    'ResumeBasics',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      resumeId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'resumes',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      fullName: { type: DataTypes.TEXT, allowNull: true },
      headline: { type: DataTypes.TEXT, allowNull: true },
      email: { type: DataTypes.TEXT, allowNull: true },
      phone: { type: DataTypes.TEXT, allowNull: true },
      location: { type: DataTypes.TEXT, allowNull: true },
      summary: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'resume_basics',
      timestamps: true,
      indexes: [{ fields: ['resumeId'], unique: true }],
    },
  );

  return ResumeBasics;
};

export default resumeModel;