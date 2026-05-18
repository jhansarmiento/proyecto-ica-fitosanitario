import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class Vereda extends Model {
    public id_vereda!: string;
    public nombre!: string;
    public id_municipio!: string; // Clave foránea para el Departamento (Catálogo)

    static associate(models: any) {
        // Una vereda pertenece a un municipio
        this.belongsTo(models.Municipio, {
            foreignKey: 'id_municipio',
            as: 'municipio',
            onDelete: 'CASCADE',
        });
    }

}

Vereda.init(
    {
        id_vereda: {
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_municipio: {
            type: DataTypes.STRING,
            allowNull: false,
            references : {
                model: 'municipio', // Nombre de la tabla referenciada
                key: 'id_municipio', // Columna referenciada
            }
        },
    }, 
    {
        sequelize: sequelizeCatalog,
        tableName: 'vereda',
        freezeTableName: true
    }
);

export default Vereda;