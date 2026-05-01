import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class LugarProduccion extends Model {
    public id!: string;
    public nombreLugarProduccion!: string;
    public numeroRegistroICA!: string;
    public estado!: string;
    public idUsuarioProductor!: string; // Clave foránea para el Productor (Usuario)
}

LugarProduccion.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombreLugarProduccion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    numeroRegistroICA: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    idUsuarioProductor: {
        type: DataTypes.UUID,
        allowNull: false,
    },
},   
    {
        sequelize,
        tableName: 'Lugar_Produccion',
    }
)

export default LugarProduccion;