import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class Municipio extends Model {
    public id!: string;
    public nombre!: string;
    public idDepartamento!: string; // Clave foránea para el Departamento (Catálogo)

    static associate(models: any) {
        // Un municipio pertenece a un departamento
        this.belongsTo(models.Departamento, {
            foreignKey: 'idDepartamento',
            as: 'departamento',
            onDelete: 'CASCADE',
        });
        // Un municipio tiene muchas veredas
        this.hasMany(models.Vereda, {
            foreignKey: 'idMunicipio',
            as: 'veredas',
            onDelete: 'CASCADE',
        })
    }
}

Municipio.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        idDepartamento: {
            type: DataTypes.STRING,
            allowNull: false,
            references : {
                model: 'departamento', // Nombre de la tabla referenciada
                key: 'id', // Columna referenciada
            }
        },
    }, 
    {
        sequelize: sequelizeCatalog,
        tableName: 'municipio',
        freezeTableName: true
    }
)

export default Municipio;