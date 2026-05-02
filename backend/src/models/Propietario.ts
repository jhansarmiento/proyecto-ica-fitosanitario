import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Propietario extends Model {
    public id!: string;
    public numeroIdentificacion!: string;
    public nombre!: string;
    public direccion!: string;
    public telefono!: string;
    public correoElectronico!: string;
}

Propietario.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    numeroIdentificacion: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    direccion: {
        type: DataTypes.STRING,
    },
    telefono: {
        type: DataTypes.STRING,
    },
    correoElectronico: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
},   
    {
        sequelize,
        tableName: 'propietario',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default Propietario;