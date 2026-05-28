/**
 * Modelo de tokens de recuperación de contraseña.
 *
 * Seguridad:
 * - No se guarda el token en texto plano.
 * - Solo se guarda `token_hash` (SHA-256) en base de datos.
 * - `expires_at` define vencimiento.
 * - `used_at` garantiza un solo uso.
 */
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PasswordResetTokenAttributes {
  id_token: string;
  id_usuario: string;
  token_hash: string;
  expires_at: Date;
  used_at?: Date | null;
  created_at: Date;
}

type PasswordResetTokenCreationAttributes = Optional<
  PasswordResetTokenAttributes,
  'id_token' | 'used_at' | 'created_at'
>;

class PasswordResetToken
  extends Model<PasswordResetTokenAttributes, PasswordResetTokenCreationAttributes>
  implements PasswordResetTokenAttributes
{
  declare id_token: string;
  declare id_usuario: string;
  declare token_hash: string;
  declare expires_at: Date;
  declare used_at: Date | null;
  declare created_at: Date;
}

PasswordResetToken.init(
  {
    id_token: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'PasswordResetToken',
    tableName: 'password_reset_tokens',
    timestamps: false,
  },
);

export default PasswordResetToken;
