import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Rol extends Model {
  public id_rol!: string;
  public nombre_rol!: string;
  public descripcion!: string; 

  static associate(models: any) {
    // Un Rol puede tener muchos Usuarios
    this.hasMany(models.Usuario, {
    foreignKey: 'id_rol',
    as: 'usuarios',
    });
  }
}

Rol.init(
  {
    id_rol: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre_rol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'nombreRol',
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'rol',
    freezeTableName: true,
  }
);

export default Rol;