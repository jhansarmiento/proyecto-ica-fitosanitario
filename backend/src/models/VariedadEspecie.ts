import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class VariedadEspecie extends Model {
    public id_variedad_especie!: string;
    public nombre_variedad!: string;
    public id_especie_vegetal!: string; // Clave foránea para EspecieVegetal

    static associate(models: any) {
        // Una variedad pertenece a una especie vegetal
        this.belongsTo(models.EspecieVegetal, {
            foreignKey: 'id_especie_vegetal',
            as: 'especieVegetal'
        })
    }
}

VariedadEspecie.init(
    {
        id_variedad_especie: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nombre_variedad: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_especie_vegetal: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
    },   
    {
        sequelize: sequelizeCatalog,
        tableName: 'variedad_especie',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default VariedadEspecie;