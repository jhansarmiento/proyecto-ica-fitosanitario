import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Propietario extends Model {
    public id_propietario!: string;
    public numero_identificacion!: string;
    public nombre!: string;
    public direccion!: string;
    public telefono!: string;
    public correo_electronico!: string;

    static associate(models: any) {
        // Un Propietario puede tener muchos Predios
        this.hasMany(models.Predio, {
            foreignKey: 'id_propietario',
            as: 'predios'
        })
    }
}

Propietario.init(
    {
        id_propietario: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        numero_identificacion: {
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
        correo_electronico: {
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