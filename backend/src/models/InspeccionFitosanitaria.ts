import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class InspeccionFitosanitaria extends Model {
    public id!: string;
    public cantidadPlantas!: number;
    public estadoFenologico!: string;
    public fechaInspeccion!: Date;
    public observaciones!: string;
    public idUsuarioAsistente!: string; // Clave foránea para el Asistente Técnico (Usuario)
    public idLote!: string; // Clave foránea para el Lote
}

InspeccionFitosanitaria.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        cantidadPlantas: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        estadoFenologico: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fechaInspeccion: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        idUsuarioAsistente: {
            type: DataTypes.UUID,
            allowNull: false,
        //     references : {
        //         model: 'usuario', // Nombre de la tabla referenciada
        //         key: 'id', // Columna referenciada
        //     }
        },
        idLote: {
            type: DataTypes.UUID,
            allowNull: false,
        //     references : {
        //         model: 'lote', // Nombre de la tabla referenciada
        //         key: 'id', // Columna referenciada
        //     }
        },
    },   
    {
        sequelize,
        tableName: 'inspeccion_fitosanitaria',
        freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
    }
)

export default InspeccionFitosanitaria;
