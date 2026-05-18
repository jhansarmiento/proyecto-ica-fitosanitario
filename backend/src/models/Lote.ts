import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Lote extends Model {
    public id_lote!: string;
    public numero_lote!: string;
    public area_total!: number;
    public fecha_siembra!: Date;
    public fecha_cosecha!: Date;
    public id_variedad!: string; // Clave foránea para la Variedad de Especie (BD Catalógo) -- Ejemplo: Hass, Cafe, etc
    public id_predio!: string; // Clave foránea para el Lugar de Producción

    static associate(models: any) {
        // Un lote pertenece a un predio
        this.belongsTo(models.Predio, {
            foreignKey: 'id_predio',
            as: 'predio',
        });
        // Un lote puede tener muchas solicitudes de inspección
        this.hasMany(models.SolicitudInspeccion, {
            foreignKey: 'id_lote',
            as: 'solicitudesInspeccion',
        });
    }
}

Lote.init(
    {
        id_lote: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        numero_lote: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        area_total: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        fecha_siembra: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_cosecha: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        id_variedad: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        id_predio: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'predio', // Nombre de la tabla referenciada
                key: 'id_predio', // Columna referenciada
            }
        },
    },   
    {
        sequelize,
        tableName: 'lote',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default Lote;