import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class SolicitudRegistroLugar extends Model {
  public id!: string;
  public fechaSolicitud!: Date;
  public estado!: string; // Pendiente, Aprobada, Rechazada
  public observacionesAdministrador?: string; // Solo se llena si el estado es Rechazada
  public idLugarProduccion!: string;
  public idAdminAprobador!: string; // Clave foránea para el Administrador (Usuario)
  public idAsistenteAsignado?: string; // Clave foránea para el Asistente Técnico (Usuario), solo se llena si el estado es Aprobada

  static associate(models: any) {
    // Una Solicitud de Registro pertenece a un Lugar de Producción
    this.belongsTo(models.LugarProduccion, {
      foreignKey: 'idLugarProduccion',
      as: 'lugarProduccion',
    });
    // Una Solicitud de Registro es aprobada por un Usuario (Administrador)
    this.belongsTo(models.Usuario, {
      foreignKey: 'idAdminAprobador',
      as: 'administradorAprobador',
    })
    // Una Solicitud de Registro es asignada a un Usuario (Asistente Técnico)
    this.belongsTo(models.Usuario, {
      foreignKey: 'idAsistenteAsignado',
      as: 'asistenteAsignado'
    })
  }
}

SolicitudRegistroLugar.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fechaSolicitud: {
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
    observacionesAdministrador: {
      type: DataTypes.STRING,
      allowNull: true, // Solo se llena si el estado es Rechazada
    },
    idLugarProduccion: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'lugar_produccion', // Nombre de la tabla referenciada
        key: 'id', // Columna referenciada
      },
    },
    idAdminAprobador: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuario', // Nombre de la tabla referenciada
        key: 'id', // Columna referenciada
      },
    },
    idAsistenteAsignado: {
      type: DataTypes.UUID,
      allowNull: true, // Solo se llena si el estado es Aprobada
      references: {
        model: 'usuario', // Nombre de la tabla referenciada
        key: 'id', // Columna referenciada
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
