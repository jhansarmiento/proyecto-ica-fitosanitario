import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

/**
 * Modelo Sequelize de la entidad EspecieVegetal en BD de catálogo.
 *
 * Tabla física: `especie_vegetal`
 * Convención de columnas (persistencia): snake_case
 * - id_especie_vegetal
 * - nombre_especie
 * - nombre_comun
 * - ciclo_cultivo
 * - imagen_especie_vegetal
 *
 * Nota de arquitectura:
 * - El mapeo a camelCase (UML/TypeScript/frontend) se realiza en controller/service.
 */
class EspecieVegetal extends Model {
    public id_especie_vegetal!: string;
    public nombre_especie!: string;
    public nombre_comun!: string;
    public ciclo_cultivo!: string;
    public imagen_especie_vegetal?: string | null;

    static associate(models: any) {
        // Una especie vegetal tiene muchas variedades
        this.hasMany(models.VariedadEspecie, {
            foreignKey: 'id_especie_vegetal',
            as: 'variedades'
        });

        // Relación muchos a muchos con plagas a través de especie_plaga
        this.belongsToMany(models.Plaga, {
            through: models.EspeciePlaga,
            foreignKey: 'id_especie_vegetal',
            otherKey: 'id_plaga',
            as: 'plagas'
        });
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
        imagen_especie_vegetal: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize: sequelizeCatalog,
        tableName: 'especie_vegetal',
        freezeTableName: true,
        timestamps: false,
    }
);

export default EspecieVegetal;
