import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class EspecieVegetal extends Model {
    public id!: string;
    public nombreEspecie!: string;
    public nombreComun!: string;
    public cicloCultivo!: string;
}

EspecieVegetal.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombreEspecie: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nombreComun: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cicloCultivo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},   
    {
        sequelize: sequelizeCatalog,
        tableName: 'especie_vegetal',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default EspecieVegetal;