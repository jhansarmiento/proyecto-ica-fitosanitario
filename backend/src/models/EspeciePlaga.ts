import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class EspeciePlaga extends Model {
    public id_especie_vegetal!: string;
    public id_plaga!: string;
}

EspeciePlaga.init(
    {
        id_especie_vegetal: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: 'especie_vegetal', // Nombre de la tabla referenciada
                key: 'id_especie_vegetal', // Columna referenciada
            }
        },
        id_plaga: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: 'plaga', // Nombre de la tabla referenciada
                key: 'id_plaga', // Columna referenciada
            }
        },
    },
    {
        sequelize: sequelizeCatalog,
        tableName: 'especie_plaga',
        freezeTableName: true
    }
);

export default EspeciePlaga;