import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Usuario extends Model {
  public id!: string;
  public numeroIdentificacion!: string;
  public nombre!: string;
  public apellidos!: string;
  public direccion!: string;
  public telefono!: string;
  public correoElectronico!: string;
  public ingresoUsuario!: string;
  public ingresoContrasena!: string;
  public tarjetaProfesional?: string; // Opcional, solo para asistentes
  // public idRol!: string; // Clave foránea para el Rol (Operacional)
}

Usuario.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    numeroIdentificacion: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
    },
    telefono: {
      type: DataTypes.STRING,
    },
    correoElectronico: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    ingresoUsuario: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ingresoContrasena: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tarjetaProfesional: {
      type: DataTypes.STRING,
      allowNull: true, // Solo se llena si es Asistente Técnico
    },
    // idRol: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   references: {
    //     model: 'rol', // Nombre de la tabla referenciada
    //     key: 'id', // Columna referenciada
    //   },
    // },
  },
  {
    sequelize,
    tableName: 'usuario',
    freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
  }
);

export default Usuario;