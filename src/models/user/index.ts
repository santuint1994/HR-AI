import { DataTypes, Model, Sequelize } from 'sequelize';

export type TUserModel = Model<
  {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    password: string;
    isActive: boolean;
    isDeleted: boolean;
  },
  {
    id?: string;
    name: string;
    email: string;
    phone?: string | null;
    password: string;
    isActive?: boolean;
    isDeleted?: boolean;
  }
>;

const userModel = (sequelize: Sequelize) => {
  const User = sequelize.define<TUserModel>(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
    },
  );

  return User;
};

export default userModel;
