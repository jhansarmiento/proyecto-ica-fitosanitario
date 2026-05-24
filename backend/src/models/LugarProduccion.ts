import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class LugarProduccion extends Model {
    public id_lugar_produccion!: string;
    public nombre_lugar_produccion!: string;
    public numero_registro_ica!: string;
    public fecha_solicitud!: Date;
    public fecha_aprobacion!: Date;
    public estado!: string;
    public observaciones_administrador?: string;
    public id_admin_aprobador!: string;
    public id_asistente_asignado?: string;
    public id_usuario_productor!: string; // Clave foránea para el Productor (Usuario)

    // Métodos de asociación
    static associate(models: any) {
        // Un Lugar de Producción pertenece a un Usuario (Productor)
        this.belongsTo(models.Usuario, {
            foreignKey: 'id_usuario',
            as: 'productor',
        });
        // Un Lugar de Producción puede tener muchos Predios
        this.hasMany(models.Predio, {
            foreignKey: 'id_lugar_produccion',
            as: 'predio',
        });
        // Un Lugar de Producción puede tener muchos Lotes
        this.hasMany(models.Lote, {
            foreignKey: 'id_lugar_produccion',
            as: 'lote', 
        });
        // Una Solicitud de Registro es aprobada por un Usuario (Administrador)
        this.belongsTo(models.Usuario, {
        foreignKey: 'id_admin_aprobador',
        as: 'administradorAprobador',
        });
        // Una Solicitud de Registro es asignada a un Usuario (Asistente Técnico)
        this.belongsTo(models.Usuario, {
        foreignKey: 'id_asistente_asignado',
        as: 'asistenteAsignado'
        });
        // Un Lugar de Producción puede asociar muchas especies para producción (Autorización de Especies)
        this.hasMany(models.AutorizacionEspecie, {
            foreignKey: 'id_lugar_produccion',
            as: 'autorizacionEspecie',
        })
    }
}

LugarProduccion.init(
    {
        id_lugar_produccion: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nombre_lugar_produccion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numero_registro_ica: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        fecha_solicitud: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_aprobacion: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        observaciones_administrador: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        id_admin_aprobador: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'usuario', // Nombre de la tabla referenciada
                key: 'id_usuario', // Columna referenciada
            }
        },
        id_asistente_asignado: {
            type: DataTypes.UUID,
            allowNull: true,
            references : {
                model: 'usuario', // Nombre de la tabla referenciada
                key: 'id_usuario', // Columna referenciada
            }
        },
        id_usuario_productor: {
            type: DataTypes.UUID,
            allowNull: false,
            references : {
                model: 'usuario', // Nombre de la tabla referenciada
                key: 'id_usuario', // Columna referenciada
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