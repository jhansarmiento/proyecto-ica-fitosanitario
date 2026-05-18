import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class EspecieVegetal extends Model {
    public id_especie_vegetal!: string;
    public nombre_especie!: string;
    public nombre_comun!: string;
    public ciclo_cultivo!: string;

    static associate(models: any) {
        // Una especie vegetal tiene muchas variedades
        this.hasMany(models.VariedadEspecie, {
            foreignKey: 'id_especie_vegetal',   
            as: 'variedades'
        });
        // Relación muchos a muchos con Plaga a través de EspeciePlaga
        this.belongsToMany(models.Plaga, {
            through: models.EspeciePlaga,
            foreignKey: 'id_especie_vegetal',
            otherKey: 'id_plaga',
            as: 'plagas'
        })
    }
}

EspecieVegetal.init(
    {
        id_especie_vegetal: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nombre_especie: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nombre_comun: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ciclo_cultivo: {
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