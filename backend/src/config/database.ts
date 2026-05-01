// Este archivo solo se encarga de decirle a Sequelize cómo conectarse a la base de datos. No define modelos ni tablas, solo la conexión.

import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv'; 

dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST as string; 
const dbPassword = process.env.DB_PASSWORD as string; 

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'postgres',
  logging: false,
});

export const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD Operacional establecida exitosamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos operacional:', error);
  }
};

export default sequelize;