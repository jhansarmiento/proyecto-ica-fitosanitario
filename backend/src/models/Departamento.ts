import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class Departamento extends Model {
  public id!: string;
  public nombre!: string;
}

Departamento.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, 
    {
        sequelize: sequelizeCatalog,
        tableName: 'departamento',
        freezeTableName: true
    }
);

export default Departamento;