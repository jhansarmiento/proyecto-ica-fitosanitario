import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class SolicitudInspeccion extends Model {
    public id_solicitud_inspeccion!: string;
    public fecha_creacion!: Date;
    public fecha_tentativa_productor!: Date; // Fecha tentativa propuesta por el Productor
    public fecha_programada_tecnico?: Date; // Cuando el tecnico confirma que irá
    public estado!: string; // 'SOLICITADA', 'PROGRAMADA', 'REALIZADA', 'CANCELADA'
    public observaciones?: string;
    public observaciones_tecnico?: string;
    public id_lugar_produccion!: string; // FK a LugarProduccion

    static associate(models: any) {
        // Una solicitud de inspección tiene un asistente técnico asignado
        this.belongsTo(models.Usuario, {
            foreignKey: 'id_asistente_tecnico',
            as: 'asistenteTecnico',
        })
        // Una solicitud de inspección tiene una inspección fitosanitaria asociada
        this.hasOne(models.InspeccionFitosanitaria, {
            foreignKey: 'id_solicitud_inspeccion',
            as: 'inspeccionFitosanitaria',
        });
        // Una solicitud de inspección pertenece a un lugar de producción
        this.belongsTo(models.LugarProduccion, { 
            foreignKey: 'id_lugar_produccion', 
            as: 'lugarProduccion' 
        });
    }
}

SolicitudInspeccion.init(
    {
        id_solicitud_inspeccion: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        fecha_tentativa_productor: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_programada_tecnico: {
            type: DataTypes.DATE,
            allowNull: true, // Se llena cuando el técnico confirma la fecha
        },
        estado: {
            type: DataTypes.STRING,
            defaultValue: 'SOLICITADA',
            validate: {
                isIn: [['SOLICITADA', 'PROGRAMADA', 'REALIZADA', 'CANCELADA', 'NO PROGRAMADA']],
            },
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        observaciones_tecnico: { 
            type: DataTypes.TEXT,
            allowNull: true,
        },
        id_lugar_produccion: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'lugar_produccion', // Nombre de la tabla física
                key: 'id_lugar_produccion',
            }
        },
        id_asistente_tecnico: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'usuario',
                key: 'id_usuario',
            },
        },
    },
    {
        sequelize,
        tableName: 'solicitud_inspeccion',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default SolicitudInspeccion;