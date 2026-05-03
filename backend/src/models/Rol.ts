import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Rol extends Model {
  public id!: string;
  public nombreRol!: string;

  static associate(models: any) {
    // Un Rol puede tener muchos Usuarios
    this.hasMany(models.Usuario, {
    foreignKey: 'idRol',
    as: 'usuarios',
    });
  }
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