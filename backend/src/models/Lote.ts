import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Lote extends Model {
    public id!: string;
    public numeroLote!: string;
    public areaTotal!: number;
    public fechaSiembra!: Date;
    public fechaCosecha!: Date;
    public idVariedad!: string; // Clave foránea para la Variedad Ejemplo: Hass, Cafe, etc
    public idPredio!: string; // Clave foránea para el Lugar de Producción

    static associate(models: any) {
        // Un lote pertenece a un predio
        this.belongsTo(models.Predio, {
            foreignKey: 'idPredio',
            as: 'predio',
        });
        // Un lote puede tener muchas solicitudes de inspección
        this.hasMany(models.SolicitudInspeccion, {
            foreignKey: 'idLote',
            as: 'solicitudesInspeccion',
        });
    }
}

Lote.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        numeroLote: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        areaTotal: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        fechaSiembra: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fechaCosecha: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        idVariedad: {
        type: DataTypes.UUID,
        allowNull: false,
        //  references : {
        //      model: 'variedad_especie', // Nombre de la tabla referenciada
        //      key: 'id', // Columna referenciada
        //  }
        },
        idPredio: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'lugar_produccion', // Nombre de la tabla referenciada
                key: 'id', // Columna referenciada
            }
        },
    },   
    {
        sequelize,
        tableName: 'lote',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default Lote;