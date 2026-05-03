import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class EspeciePlaga extends Model {
    public idEspecieVegetal!: string;
    public idPlaga!: string;
}

EspeciePlaga.init(
    {
        idEspecieVegetal: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: 'especie_vegetal', // Nombre de la tabla referenciada
                key: 'id', // Columna referenciada
            }
        },
        idPlaga: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: 'plaga', // Nombre de la tabla referenciada
                key: 'id', // Columna referenciada
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