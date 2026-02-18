import { DataTypes, Model, Sequelize } from 'sequelize';

export type TInterviewModel = Model<
  {
    id: string;
    resumeId: string;
    requiredStack: string[];
    requiredStackKey: string;
    candidateSummary: string;
    experienceLevel: string;
    candidateSkills: string[];
    requiredSkills: string[];
  },
  {
    id?: string;
    resumeId: string;
    requiredStack: string[];
    requiredStackKey: string;
    candidateSummary: string;
    experienceLevel: string;
    candidateSkills: string[];
    requiredSkills: string[];
  }
>;

const interviewModel = (sequelize: Sequelize) => {
  const Interview = sequelize.define<TInterviewModel>(
    'Interview',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      resumeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'resumes',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      requiredStack: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: () => [],
      },
      requiredStackKey: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue: '',
      },
      candidateSummary: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      experienceLevel: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '',
      },
      candidateSkills: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: () => [],
      },
      requiredSkills: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: () => [],
      },
    },
    {
      tableName: 'interviews',
      timestamps: true,
      indexes: [
        { fields: ['resumeId'] },
        { fields: ['resumeId', 'requiredStackKey'], unique: true, name: 'interviews_resume_stack_key' },
      ],
    },
  );

  return Interview;
};

export default interviewModel;
