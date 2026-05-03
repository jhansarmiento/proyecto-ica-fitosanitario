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

    static associate(models: any) {
        // Un Predio pertenece a un Propietario
        this.belongsTo(models.Propietario, {
            foreignKey: 'idPropietario',
            as: 'propietario',
        })
        // Un Predio pertenece a un Lugar de Producción
        this.belongsTo(models.LugarProduccion, {
            foreignKey: 'idLugarProduccion',
            as: 'lugarProduccion',
        })
        // Un predio puede tener muchos lotes
        this.hasMany(models.Lote, {
            foreignKey: 'idPredio',
            as: 'lotes',
        })
    }
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
            references : {
                model: 'lugar_produccion', // Nombre de la tabla referenciada
                key: 'id', // Columna referenciada
            }
        },
        idPropietario: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'propietario', // Nombre de la tabla referenciada
                key: 'id', // Columna referenciada
            }
        },
    },
    {
        sequelize,
        tableName: 'predio',
        freezeTableName: true
    }
)

export default Predio;