import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class Municipio extends Model {
  public id!: string;
  public nombre!: string;
  // public idDepartamento!: string; // Clave foránea para el Departamento (Catálogo)
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
    // idDepartamento: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    //     references : {
    //         model: 'departamento', // Nombre de la tabla referenciada
    //         key: 'id', // Columna referenciada
    //     }
    // },
    }, 
    {
        sequelize: sequelizeCatalog,
        tableName: 'municipio',
        freezeTableName: true
    }
)

export default Municipio;