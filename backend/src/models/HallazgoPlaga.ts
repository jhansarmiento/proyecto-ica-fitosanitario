import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database'; // Base de datos OPERACIONAL

class HallazgoPlaga extends Model {
    public id_hallazgo_plaga!: string
    public cantidad_plantas_infestadas!: number
    public porcentaje_infestacion!: number
    public id_plaga!: string // Dato traído desde la BD Catalógo 
    public id_inspeccion_fitosanitaria!: string // Clave foránea para InspeccionFitosanitaria

    static associate(models: any) {
        // Un hallazgo de plaga pertenece a una inspección fitosanitaria
        this.belongsTo(models.InspeccionFitosanitaria, {
            foreignKey: 'id_inspeccion_fitosanitaria',
            as: 'inspeccionFitosanitaria',
        })
    }
}

HallazgoPlaga.init(
    {
        id_hallazgo_plaga: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        cantidad_plantas_infestadas: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        porcentaje_infestacion: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        id_plaga: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        id_inspeccion_fitosanitaria: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'inspeccion_fitosanitaria', // Nombre de la tabla referenciada
                key: 'id_inspeccion_fitosanitaria', // Columna referenciada
            }
        },
    },
    {
        sequelize,
        tableName: 'hallazgo_plaga',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default HallazgoPlaga;