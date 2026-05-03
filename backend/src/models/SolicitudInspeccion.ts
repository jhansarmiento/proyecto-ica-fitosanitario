import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class SolicitudInspeccion extends Model {
    public id!: string;
    public fechaCreacion!: Date;
    public fechaTentativaProductor!: Date; // Fecha tentativa propuesta por el Productor
    public fechaProgramadaTecnico!: Date; // Cuando el tecnico confirma que irá
    public estado!: string; // 'SOLICITADA', 'PROGRAMADA', 'REALIZADA', 'CANCELADA'
    public idLote!: string; // Clave foránea para el Lote
    public idAsistenteTecnico!: string; // Clave foránea para el Asistente Técnico (Usuario)
}

SolicitudInspeccion.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        fechaCreacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        fechaTentativaProductor: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fechaProgramadaTecnico: {
            type: DataTypes.DATE,
            allowNull: true, // Se llena cuando el técnico confirma la fecha
        },
        estado: {
            type: DataTypes.STRING,
            defaultValue: 'SOLICITADA',
            validate: {
                isIn: [['SOLICITADA', 'PROGRAMADA', 'REALIZADA', 'CANCELADA']],
            },
        },
        idLote: {
            type: DataTypes.UUID,
            allowNull: false,
        //     references : {
        //         model: 'lote', // Nombre de la tabla referenciada
        //         key: 'id', // Columna referenciada
        //     }
        },
        idAsistenteTecnico: {
            type: DataTypes.UUID,
            allowNull: false,
        //     references : {
        //         model: 'usuario', // Nombre de la tabla referenciada
        //         key: 'id', // Columna referenciada
        //     }
        },
    },
    {
        sequelize,
        tableName: 'solicitud_inspeccion',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default SolicitudInspeccion;