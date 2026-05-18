import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class Municipio extends Model {
    public id_municipio!: string;
    public nombre!: string;
    public id_departamento!: string; // Clave foránea para el Departamento (Catálogo)

    static associate(models: any) {
        // Un municipio pertenece a un departamento
        this.belongsTo(models.Departamento, {
            foreignKey: 'id_departamento',
            as: 'departamento',
            onDelete: 'CASCADE',
        });
        // Un municipio tiene muchas veredas
        this.hasMany(models.Vereda, {
            foreignKey: 'id_municipio',
            as: 'veredas',
            onDelete: 'CASCADE',
        })
    }
}

Municipio.init({
        id_municipio: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_departamento: {
            type: DataTypes.STRING,
            allowNull: false,
            references : {
                model: 'departamento', // Nombre de la tabla referenciada
                key: 'id_departamento', // Columna referenciada
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