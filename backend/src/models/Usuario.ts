import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Usuario extends Model {
  public id_usuario!: string;
  public numero_identificacion!: string;
  public nombre!: string;
  public apellidos!: string;
  public direccion!: string;
  public telefono!: string;
  public correo_electronico!: string;
  public ingreso_usuario!: string;
  public ingreso_contrasena!: string;
  public tarjeta_profesional?: string; // Opcional, solo para asistentes
  public id_rol!: string; // Clave foránea para el Rol (Operacional)

  static associate(models: any) {
    // Un Usuario tiene un solo Rol
    this.belongsTo(models.Rol, {
      foreignKey: 'id_rol',
      as: 'rol',
    });
    // Un Usuario (Productor) puede tener muchos Lugares de Producción
    this.hasMany(models.LugarProduccion, {
      foreignKey: 'id_usuario_productor',
      as: 'lugarProduccion',
    });
    // Un Usuario (Administrador) puede aprobar muchas Solicitudes de Registro
    this.hasMany(models.SolicitudRegistroLugar, {
      foreignKey: 'id_admin_aprobador',
      as: 'solicitudesAprobadas',
    });
    // Un Usuario (Asistente) puede ser asignado a muchas Solicitudes de Registro
    this.hasMany(models.SolicitudRegistroLugar, {
      foreignKey: 'id_asistente_asignado',
      as: 'asignacionesTecnicas',
    });
    // Un Usuario (Asistente) puede tener una Solicitud de Inspección asignada
    this.hasOne(models.SolicitudInspeccion, {
      foreignKey: 'id_asistente_tecnico',
      as: 'solicitudInspeccion',
    });
  }
}

Usuario.init(
  {
    id_usuario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    numero_identificacion: {
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
    correo_electronico: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    ingreso_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ingreso_contrasena: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tarjeta_profesional: {
      type: DataTypes.STRING,
      allowNull: true, // Solo se llena si es Asistente Técnico
    },
    id_rol: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'id_rol',
      references: {
        model: 'rol', // Nombre de la tabla referenciada
        key: 'id_rol', // Columna referenciada
      },
    },
  },
  {
    sequelize,
    tableName: 'usuario',
    freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    defaultScope: {
      attributes: { exclude: ['ingreso_contrasena'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['ingreso_contrasena'] },
      },
    },
  }
);

export default Usuario;