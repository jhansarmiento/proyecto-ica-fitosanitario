import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Lote extends Model {
    public id!: string;
    public numeroLote!: string;
    public areaTotal!: number;
    public fechaSiembra!: Date;
    public fechaCosecha!: Date;
    // public id_variedad!: string; // Clave foránea para la Variedad Ejemplo: Hass, Cafe, etc
    public idLugarProduccion!: string; // Clave foránea para el Lugar de Producción
}

Lote.init({
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
    //id_variedad: {
      //  type: DataTypes.UUID,
      //  allowNull: false,
      //  references : {
      //      model: 'Variedad', // Nombre de la tabla referenciada
      //      key: 'id', // Columna referenciada
      //  }
    // },
    idLugarProduccion: {
        type: DataTypes.UUID,
        allowNull: false,
        references : {
            model: 'Lugar_Produccion', // Nombre de la tabla referenciada
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