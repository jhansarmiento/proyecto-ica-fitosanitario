import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class VariedadEspecie extends Model {
    public id!: string;
    public nombreVariedad!: string;
    public idEspecie!: string; // Clave foránea para EspecieVegetal
}

VariedadEspecie.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nombreVariedad: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        idEspecie: {
            type: DataTypes.UUID,
            allowNull: false,
        //     references : {
        //         model: 'especie_vegetal', // Nombre de la tabla referenciada
        //         key: 'id', // Columna referenciada
        //     }
        },
    },   
    {
        sequelize: sequelizeCatalog,
        tableName: 'variedad_especie',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default VariedadEspecie;