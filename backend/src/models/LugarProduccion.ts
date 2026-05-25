import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class LugarProduccion extends Model {
    public id_lugar_produccion!: string;
    public nombre_lugar_produccion!: string;
    public numero_registro_ica!: string;
    public fecha_solicitud!: Date;
    public fecha_aprobacion?: Date; // opcional al inicio
    public estado!: string;
    public observaciones_administrador?: string;
    public id_admin_aprobador?: string; // opcional al inicio
    public id_asistente_asignado?: string; // opcional al inicio
    public id_usuario_productor!: string; // Clave foránea para el Productor (Usuario)

    // Métodos de asociación
    static associate(models: any) {
        // Un Lugar de Producción pertenece a un Usuario (Productor)
        this.belongsTo(models.Usuario, {
            foreignKey: 'id_usuario_productor',
            targetKey: 'id_usuario',
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
            targetKey: 'id_usuario',
            as: 'administradorAprobador',
        });
        // Una Solicitud de Registro es asignada a un Usuario (Asistente Técnico)
        this.belongsTo(models.Usuario, {
            foreignKey: 'id_asistente_asignado',
            targetKey: 'id_usuario',
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
            defaultValue: DataTypes.NOW // Se asigna con la fecha actual automaticamente
        },
        fecha_aprobacion: {
            type: DataTypes.DATE,
            allowNull: true, // opcional al inicio
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'PENDIENTE', // Nace como solicitud pendiente
            validate: {
                isIn: [['PENDIENTE', 'APROBADO', 'RECHAZADO']],
            },
        },
        observaciones_administrador: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        id_admin_aprobador: {
            type: DataTypes.UUID,
            allowNull: true,
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