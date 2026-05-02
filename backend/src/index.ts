import express from 'express';
import sequelize, { checkConnection } from './config/database';
import sequelizeCatalog, { checkConnectionCatalog } from './config/database_catalog';
// Modelos de BD Operacional
import Usuario from './models/Usuario';
import LugarProduccion from './models/LugarProduccion';
import Lote from './models/Lote';
import InspeccionFitosanitaria from './models/InspeccionFitosanitaria';
import HallazgoPlaga from './models/HallazgoPlaga';

// Modelos de BD Catalógo
import EspecieVegetal from './models/EspecieVegetal';
import VariedadEspecie from './models/VariedadEspecie';
import Plaga from './models/Plaga';

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

// Un Lugar de Producción puede tener muchos Lotes
LugarProduccion.hasMany(Lote, {
  foreignKey: 'idLugarProduccion',
  as: 'lotes',
})

// Un Lote pertenece a un único Lugar de Producción
Lote.belongsTo(LugarProduccion, {
  foreignKey: 'idLugarProduccion',
  as: 'lugarProduccion',
})

const models = {
    Usuario,
    LugarProduccion,
    Lote,
    InspeccionFitosanitaria,
    HallazgoPlaga,
    EspecieVegetal,
    VariedadEspecie,
    Plaga
}

export { sequelize, sequelizeCatalog };
export default models;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const startServer = async () => {
  try {
    // OPERACIONAL
    await checkConnection();
    await checkConnectionCatalog();  

    // DEPURACIÓN: Esto nos dirá qué modelos (tablas) tiene Sequelize en memoria
    console.log('Modelos detectados por BD Operacional:', Object.keys(sequelize.models));
    console.log('Modelos detectados por BD Catalógo:', Object.keys(sequelizeCatalog.models));

    // Forzamos la sincronización
    await sequelize.sync({ alter: true });
    console.log('📊 Tablas de BD Operacional sincronizadas');

    await sequelizeCatalog.sync({ alter: true });
    console.log('📊 Tablas de BD Catalógo sincronizadas');

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