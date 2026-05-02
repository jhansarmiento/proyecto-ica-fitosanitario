import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class AutorizacionEspecie extends Model {
  public id!: string;
  public areaDestinadaCultivo!: number;
  public capacidadProduccion!: number;
//   public idLugarProduccion!: string; // FK Física (Misma DB)
//   public idEspecieCatalogo!: string; // Relación Lógica (Hacia Catálogo)
}

AutorizacionEspecie.init({
     id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    areaDestinadaCultivo: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    capacidadProduccion: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    // idLugarProduccion: {
    //     type: DataTypes.UUID,
    //     allowNull: false,
    //     references : {
    //         model: 'lugar_produccion', // Nombre de la tabla referenciada
    //         key: 'id', // Columna referenciada
    //     }
    // },
    // idEspecieCatalogo: {
    //     type: DataTypes.UUID,
    //     allowNull: false,
    //     references : {
    //         model: 'especie_vegetal', // Nombre de la tabla referenciada
    //         key: 'id', // Columna referenciada
    //     }
    // }
}, {
  sequelize,
  tableName: 'autorizacion_especie',
  freezeTableName: true
});

export default AutorizacionEspecie;