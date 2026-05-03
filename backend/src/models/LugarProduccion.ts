import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class LugarProduccion extends Model {
    public id!: string;
    public nombreLugarProduccion!: string;
    public numeroRegistroICA!: string;
    public estado!: string;
    public idUsuarioProductor!: string; // Clave foránea para el Productor (Usuario)

    // Métodos de asociación
    static associate(models: any) {
        // Un Lugar de Producción pertenece a un Usuario (Productor)
        this.belongsTo(models.Usuario, {
            foreignKey: 'idUsuarioProductor',
            as: 'productor',
        });
        // Un Lugar de Producción tiene una Solicitud de Registro
        this.hasOne(models.SolicitudRegistroLugar, {
            foreignKey: 'idLugarProduccion',
            as: 'solicitudRegistroLugar',
        });
        // Un Lugar de Producción puede tener muchos Predios
        this.hasMany(models.Predio, {
            foreignKey: 'idLugarProduccion',
            as: 'predio',
        });
        // Un Lugar de Producción puede tener muchos Lotes
        this.hasMany(models.Lote, {
            foreignKey: 'idLugarProduccion',
            as: 'lote', 
        });
        // Un Lugar de Producción puede asociar muchas especies para producción (Autorización de Especies)
        this.hasMany(models.AutorizacionEspecie, {
            foreignKey: 'idLugarProduccion',
            as: 'autorizacionEspecie',
        })
    }
}



LugarProduccion.init(
    {
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
            references : {
                model: 'usuario', // Nombre de la tabla referenciada
                key: 'id', // Columna referenciada
            }
        },
    },   
    {
        sequelize,
        tableName: 'lugar_produccion',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
);

export default LugarProduccion;