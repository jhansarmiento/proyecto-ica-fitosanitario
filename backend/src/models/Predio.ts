import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Predio extends Model {
    public id!: string;
    public numeroPredial!: string;
    public numeroRegistroICA!: string;
    public nombrePredio!: string;
    public direccion!: string;
    public areaTotal!: number;
    public idVereda!: number;
    public idLugarProduccion!: string; // Clave foránea para el Productor (Usuario)
    public idPropietario!: string; // Clave foránea para el Propietario (Usuario)
}

Predio.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        numeroPredial: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        numeroRegistroICA: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,    
        },
        nombrePredio: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        direccion: {
            type: DataTypes.STRING,
        },
        areaTotal: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        idVereda: {
            type: DataTypes.STRING,
            allowNull: false,
        //     references : {
        //         model: 'vereda', // Nombre de la tabla referenciada
        //         key: 'id', // Columna referenciada
        //     }
        },
        idLugarProduccion: {
            type: DataTypes.UUID,
            allowNull: false,
        //     references : {
        //         model: 'lugar_produccion', // Nombre de la tabla referenciada
        //         key: 'id', // Columna referenciada
        //     }
        },
        idPropietario: {
            type: DataTypes.UUID,
            allowNull: false,
        //     references : {
        //         model: 'propietario', // Nombre de la tabla referenciada
        //         key: 'id', // Columna referenciada
        },
    },
    {
        sequelize,
        tableName: 'predio',
        freezeTableName: true
    }
)

export default Predio;