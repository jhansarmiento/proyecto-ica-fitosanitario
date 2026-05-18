import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class InspeccionFitosanitaria extends Model {
    public id_inspeccion_fitosanitaria!: string;
    public cantidad_plantas!: number;
    public estado_fenologico!: string;
    public fecha_inspeccion!: Date;
    public observaciones!: string;
    public id_solicitud_inspeccion!: string; // Clave foránea para el Asistente Técnico (Usuario)

    static associate(models: any) {
        // Una inspección fitosanitaria pertenece a una solicitud de inspección
        this.belongsTo(models.SolicitudInspeccion, {
            foreignKey: 'id_solicitud_inspeccion',
            as: 'solicitudInspeccion',
        })
        // Una inspección fitosanitaria puede tener muchos hallazgos de plagas
        this.hasMany(models.HallazgoPlaga, {
            foreignKey: 'id_inspeccion_fitosanitaria',
            as: 'hallazgosPlaga',
        })
    }
}

InspeccionFitosanitaria.init(
    {
        id_inspeccion_fitosanitaria: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        cantidad_plantas: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        estado_fenologico: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fecha_inspeccion: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        id_solicitud_inspeccion: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'solicitud_inspeccion', // Nombre de la tabla referenciada
                key: 'id_solicitud_inspeccion', // Columna referenciada
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
