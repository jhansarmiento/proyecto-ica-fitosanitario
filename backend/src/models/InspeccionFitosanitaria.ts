import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class InspeccionFitosanitaria extends Model {
    public id!: string;
    public cantidadPlantas!: number;
    public estadoFenologico!: string;
    public fechaInspeccion!: Date;
    public observaciones!: string;
    public idSolicitudInspeccion!: string; // Clave foránea para el Asistente Técnico (Usuario)

    static associate(models: any) {
        // Una inspección fitosanitaria pertenece a una solicitud de inspección
        this.belongsTo(models.SolicitudInspeccion, {
            foreignKey: 'idSolicitudInspeccion',
            as: 'solicitudInspeccion',
        })
    }
}

InspeccionFitosanitaria.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        cantidadPlantas: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        estadoFenologico: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fechaInspeccion: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        idSolicitudInspeccion: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'solicitud_inspeccion', // Nombre de la tabla referenciada
                key: 'id', // Columna referenciada
            }
        },
    },   
    {
        sequelize,
        tableName: 'inspeccion_fitosanitaria',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default InspeccionFitosanitaria;
