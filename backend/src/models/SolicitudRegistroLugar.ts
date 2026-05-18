import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class SolicitudRegistroLugar extends Model {
  public id_solicitud_registro_lugar!: string;
  public fecha_solicitud!: Date;
  public estado!: string; // Pendiente, Aprobada, Rechazada
  public observaciones_administrador?: string; // Solo se llena si el estado es Rechazada
  public id_lugar_produccion!: string;
  public id_admin_aprobador!: string; // Clave foránea para el Administrador (Usuario)
  public id_asistente_asignado?: string; // Clave foránea para el Asistente Técnico (Usuario), solo se llena si el estado es Aprobada

  static associate(models: any) {
    // Una Solicitud de Registro pertenece a un Lugar de Producción
    this.belongsTo(models.LugarProduccion, {
      foreignKey: 'id_lugar_produccion',
      as: 'lugarProduccion',
    });
    // Una Solicitud de Registro es aprobada por un Usuario (Administrador)
    this.belongsTo(models.Usuario, {
      foreignKey: 'id_admin_aprobador',
      as: 'administradorAprobador',
    })
    // Una Solicitud de Registro es asignada a un Usuario (Asistente Técnico)
    this.belongsTo(models.Usuario, {
      foreignKey: 'id_asistente_asignado',
      as: 'asistenteAsignado'
    })
  }
}

SolicitudRegistroLugar.init(
  {
    id_solicitud_registro_lugar: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fecha_solicitud: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: "Pendiente",
      validate: {
        isIn: [["Pendiente", "Aprobada", "Rechazada"]],
      },
    },
    observaciones_administrador: {
      type: DataTypes.STRING,
      allowNull: true, // Solo se llena si el estado es Rechazada
    },
    id_lugar_produccion: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'lugar_produccion', // Nombre de la tabla referenciada
        key: 'id_lugar_produccion', // Columna referenciada
      },
    },
    id_admin_aprobador: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuario', // Nombre de la tabla referenciada
        key: 'id_usuario', // Columna referenciada
      },
    },
    id_asistente_asignado: {
      type: DataTypes.UUID,
      allowNull: true, // Solo se llena si el estado es Aprobada
      references: {
        model: 'usuario', // Nombre de la tabla referenciada
        key: 'id_usuario', // Columna referenciada
      },
    },
  },
  {
    sequelize,
    tableName: "solicitud_registro_lugar",
    freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
  }
);

export default SolicitudRegistroLugar;
