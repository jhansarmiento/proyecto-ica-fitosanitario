import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class SolicitudInspeccion extends Model {
    public id_solicitud_inspeccion!: string;
    public fecha_creacion!: Date;
    public fecha_tentativa_productor!: Date; // Fecha tentativa propuesta por el Productor
    public fecha_programada_tecnico!: Date; // Cuando el tecnico confirma que irá
    public estado!: string; // 'SOLICITADA', 'PROGRAMADA', 'REALIZADA', 'CANCELADA'
    public id_lote!: string; // Clave foránea para el Lote
    public id_asistente_tecnico!: string; // Clave foránea para el Asistente Técnico (Usuario)

    static associate(models: any) {
        // Una solicitud de inspección pertenece a un lote
        this.belongsTo(models.Lote, {
            foreignKey: 'id_lote',
            as: 'lote',
        });
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
                isIn: [['SOLICITADA', 'PROGRAMADA', 'REALIZADA', 'CANCELADA']],
            },
        },
        id_lote: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'lote', // Nombre de la tabla referenciada
                key: 'id_lote', // Columna referenciada
            }
        },
        id_asistente_tecnico: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'usuario', // Nombre de la tabla referenciada
                key: 'id_usuario', // Columna referenciada
            }
        },
    },
    {
        sequelize,
        tableName: 'solicitud_inspeccion',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default SolicitudInspeccion;