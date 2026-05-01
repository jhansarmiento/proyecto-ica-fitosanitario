import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbCatalogName = process.env.DB_CATALOG_NAME as string;
const dbCatalogUser = process.env.DB_CATALOG_USER as string;
const dbCatalogPassword = process.env.DB_CATALOG_PASSWORD as string;
const dbCatalogHost = process.env.DB_CATALOG_HOST as string;

const sequelizeCatalog = new Sequelize(
    dbCatalogName,
    dbCatalogUser,
    dbCatalogPassword,  
    {
        host: dbCatalogHost,
        dialect: 'postgres',
        logging: false, // Desactiva el logging de Sequelize para esta conexión
    }
)

export const checkConnectionCatalog = async () => {
  try {
    await sequelizeCatalog.authenticate();
    console.log('✅ Conexión a BD Catalógo establecida exitosamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la BDCatalógo:', error);
  }
};

export default sequelizeCatalog;