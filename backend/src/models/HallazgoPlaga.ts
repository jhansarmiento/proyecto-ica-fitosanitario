import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database'; // Base de datos OPERACIONAL

class HallazgoPlaga extends Model {
    public id!: string
    public cantidadPlantasInfestadas!: number
    public porcentajeInfestacion!: number
    // public idPlaga!: string // Clave foránea para Plaga
    // public idInspeccion!: string // Clave foránea para InspeccionFitosanitaria
}

HallazgoPlaga.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    cantidadPlantasInfestadas: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    porcentajeInfestacion: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    // idPlaga: {
    //     type: DataTypes.UUID,
    //     allowNull: false,
    //     references : {
    //         model: 'plaga', // Nombre de la tabla referenciada
    //         key: 'id', // Columna referenciada
    //     }
    // },
    // idInspeccion: {
    //     type: DataTypes.UUID,
    //     allowNull: false,
    //     references : {
    //         model: 'inspeccion_fitosanitaria', // Nombre de la tabla referenciada
    //         key: 'id', // Columna referenciada
    //     }
    // },
},
    {
        sequelize,
        tableName: 'hallazgo_plaga',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default HallazgoPlaga;