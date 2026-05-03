import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class Plaga extends Model {
    public id!: string;
    public nombrePlaga!: string;

    static associate(models: any) {
        // Una plaga puede afectar a muchas especies vegetales (relación muchos a muchos)
        this.belongsToMany(models.EspecieVegetal, {
            through: models.EspeciePlaga,
            foreignKey: 'idPlaga',
            otherKey: 'idEspecieVegetal',
            as: 'especiesAfectadas'
        });
    }
}

Plaga.init(
    {
        id: { 
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4, 
            primaryKey: true 
        },
        nombrePlaga: { 
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