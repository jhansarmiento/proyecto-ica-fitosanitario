import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Predio extends Model {
    public id_predio!: string;
    public numero_predial!: string;
    public numero_registro_ica!: string;
    public nombre_predio!: string;
    public direccion!: string;
    public area_total!: number;
    public id_vereda!: number; // Vereda traída desde la BD Catalógo
    public id_lugar_produccion?: string; // Clave foránea para el Productor (Usuario)
    public id_propietario!: string; // Clave foránea para el Propietario (Usuario)

    static associate(models: any) {
        // Un Predio pertenece a un Propietario
        this.belongsTo(models.Propietario, {
            foreignKey: 'id_propietario',
            as: 'propietario',
        })
        // Un Predio pertenece a un Lugar de Producción
        this.belongsTo(models.LugarProduccion, {
            foreignKey: 'id_lugar_produccion',
            as: 'lugarProduccion',
        })
        // Un predio puede tener muchos lotes
        this.hasMany(models.Lote, {
            foreignKey: 'id_predio',
            as: 'lotes',
        })
    }
}

Predio.init(
    {
        id_predio: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        numero_predial: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        numero_registro_ica: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,    
        },
        nombre_predio: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        direccion: {
            type: DataTypes.STRING,
        },
        area_total: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        id_vereda: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_lugar_produccion: {
            type: DataTypes.UUID,
            allowNull: true,
            references : {
                model: 'lugar_produccion', // Nombre de la tabla referenciada
                key: 'id_lugar_produccion', // Columna referenciada
            }
        },
        id_propietario: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'propietario', // Nombre de la tabla referenciada
                key: 'id_propietario', // Columna referenciada
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