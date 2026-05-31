import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Notificacion extends Model {
  public id_notificacion!: string;
  public id_usuario_destino!: string;
  public titulo!: string;
  public mensaje!: string;
  public tipo!: 'info' | 'success' | 'warning' | 'error';
  public leida!: boolean;
  public metadata?: object | null;

  static associate(models: any) {
    this.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario_destino',
      as: 'usuarioDestino',
    });
  }
}

Notificacion.init(
  {
    id_notificacion: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_usuario_destino: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuario',
        key: 'id_usuario',
      },
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'info',
    },
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notificacion',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
  }
);

export default Notificacion;
