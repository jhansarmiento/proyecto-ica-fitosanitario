import { Model, DataTypes } from 'sequelize';
import sequelizeCatalog from '../config/database_catalog';

class Departamento extends Model {
  public id_departamento!: string;
  public nombre!: string;

    static associate(models: any) {
        // Un departamento tiene muchos municipios
        this.hasMany(models.Municipio, {
            foreignKey: 'id_departamento',
            as: 'municipios',
            onDelete: 'CASCADE',
        });
    }
}

Departamento.init(
    {
        id_departamento: {
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