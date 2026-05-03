import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class Vereda extends Model {
    public id!: string;
    public nombre!: string;
    public idMunicipio!: string; // Clave foránea para el Departamento (Catálogo)

    static associate(models: any) {
        // Una vereda pertenece a un municipio
        this.belongsTo(models.Municipio, {
            foreignKey: 'idMunicipio',
            as: 'municipio',
            onDelete: 'CASCADE',
        });
    }

}

Vereda.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        idMunicipio: {
            type: DataTypes.STRING,
            allowNull: false,
            references : {
                model: 'municipio', // Nombre de la tabla referenciada
                key: 'id', // Columna referenciada
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