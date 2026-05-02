import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Rol extends Model {
  public id!: string;
  public nombreRol!: string;
}

Rol.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombreRol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'rol',
    freezeTableName: true,
  }
);

export default Rol;