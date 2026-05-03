import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class AutorizacionEspecie extends Model {
  public id!: string;
  public capacidadProduccion!: number;
  public idLugarProduccion!: string; // FK Física (Misma DB)
  public idEspecieVegetal!: string; // Dato traído desde la BD Catalógo (Relación Lógica, no FK física)

  static associate(models: any) {
    // Una Autorización de Especie pertenece a un Lugar de Producción
    this.belongsTo(models.LugarProduccion, {
      foreignKey: 'idLugarProduccion',
      as: 'lugarProduccion',
    });
    // NOTA: No definimos una asociación Sequelize directa con EspecieVegetal del catálogo, ya que es una relación lógica.
  }
}

AutorizacionEspecie.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        capacidadProduccion: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        idLugarProduccion: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'lugar_produccion', // Nombre de la tabla referenciada
                key: 'id', // Columna referenciada
            }
        },
        idEspecieVegetal: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, 
    {
        sequelize,
        tableName: 'autorizacion_especie',
        freezeTableName: true
    }
);

export default AutorizacionEspecie;