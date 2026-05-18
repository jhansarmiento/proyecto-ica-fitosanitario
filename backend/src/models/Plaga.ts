import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class Plaga extends Model {
    public id_plaga!: string;
    public nombre_cientifico_plaga!: string;
    public nombre_comun_plaga!: string;

    static associate(models: any) {
        // Una plaga puede afectar a muchas especies vegetales (relación muchos a muchos)
        this.belongsToMany(models.EspecieVegetal, {
            through: models.EspeciePlaga,
            foreignKey: 'id_plaga',
            otherKey: 'id_especie_vegetal',
            as: 'especiesAfectadas'
        });
    }
}

Plaga.init(
    {
        id_plaga: { 
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4, 
            primaryKey: true 
        },
        nombre_cientifico_plaga: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        nombre_comun_plaga: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
    }, 
    { 
        sequelize: sequelizeCatalog, 
        tableName: 'plaga',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
);

export default Plaga;