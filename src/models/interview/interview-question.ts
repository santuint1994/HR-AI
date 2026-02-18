import { DataTypes, Model, Sequelize } from 'sequelize';

export type TInterviewQuestionModel = Model<
  {
    id: string;
    interviewId: string;
    question: string;
    expectedAnswer: string;
    difficulty: string;
    category: string;
  },
  {
    id?: string;
    interviewId: string;
    question: string;
    expectedAnswer: string;
    difficulty: string;
    category: string;
  }
>;

const interviewQuestionModel = (sequelize: Sequelize) => {
  const InterviewQuestion = sequelize.define<TInterviewQuestionModel>(
    'InterviewQuestion',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      interviewId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'interviews',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expectedAnswer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: 'interview_questions',
      timestamps: true,
      indexes: [{ fields: ['interviewId'] }],
    },
  );

  return InterviewQuestion;
};

export default interviewQuestionModel;
