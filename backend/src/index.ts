import express from 'express';
import sequelize, { checkConnection } from './config/database'; // Ruta corregida
import Usuario from './models/Usuario';
import LugarProduccion from './models/LugarProduccion';

// Un Productor (Usuario) puede tener muchos Lugares de Producción
Usuario.hasMany(LugarProduccion, {
  foreignKey: 'idUsuarioProductor',
  as: 'lugaresProduccion',
})

// Un Lugar de Producción pertenece a un único Productor
LugarProduccion.belongsTo(Usuario, {
  foreignKey: 'idUsuarioProductor',
  as: 'productor',
})

const models = {
    Usuario,
    LugarProduccion
}

export { sequelize };
export default models;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const startServer = async () => {
  try {
    await checkConnection();

    // DEPURACIÓN: Esto nos dirá qué modelos (tablas) tiene Sequelize en memoria
    console.log('Modelos detectados por Sequelize:', Object.keys(sequelize.models));

    // Forzamos la sincronización
    await sequelize.sync({ alter: true });
    console.log('📊 Tablas de la base de datos sincronizadas');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Error crítico al iniciar el servidor:', error);
  }
};

startServer();

// Este archivo es el punto de entrada de la aplicación. 
// Aquí se configura el servidor Express, se establece la conexión a la base de datos y se definen las rutas básicas.
// 1. Verificar que hay internet/conexión.
// 2. Sincronizar las tablas (Sequelize Sync).
// 3. Encender el servidor Express.