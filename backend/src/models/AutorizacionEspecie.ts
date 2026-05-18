import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class AutorizacionEspecie extends Model {
  public id_autorizacion_especie!: string;
  public capacidad_produccion!: number;
  public id_lugar_produccion!: string; // FK Física (Misma DB)
  public id_especie_vegetal!: string; // Dato traído desde la BD Catalógo (Relación Lógica, no FK física)

  static associate(models: any) {
    // Una Autorización de Especie pertenece a un Lugar de Producción
    this.belongsTo(models.LugarProduccion, {
      foreignKey: 'id_lugar_produccion',
      as: 'lugarProduccion',
    });
    // NOTA: No definimos una asociación Sequelize directa con EspecieVegetal del catálogo, ya que es una relación lógica.
  }
}

AutorizacionEspecie.init(
    {
        id_autorizacion_especie: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        capacidad_produccion: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        id_lugar_produccion: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'lugar_produccion', // Nombre de la tabla referenciada
                key: 'id_lugar_produccion', // Columna referenciada
            }
        },
        id_especie_vegetal: {
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