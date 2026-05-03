import express from 'express';
import sequelize, { checkConnection } from './config/database';
import sequelizeCatalog, { checkConnectionCatalog } from './config/database_catalog';
import './catalogIndex';
import { seedGeoData } from './seeders/geoSeeder'; // Función para inyectar datos geográficos
import { seedEspeciesVegetales } from './seeders/especieSeeder'; // Función para inyectar datos de especies vegetales
import { seedRoles } from './seeders/rolSeeder'; // Función para inyectar roles
import { seedAdmins } from './seeders/adminSeeder'; // Función para inyectar usuarios administradores
import { seedProductores } from './seeders/productorSeeder'; // Función para inyectar usuarios productores
import { seedPropietariosYPredios } from './seeders/predioSeeder'; // Función para inyectar propietarios y predios

// Modelos de BD Operacional
import Usuario from './models/Usuario';
import LugarProduccion from './models/LugarProduccion';
import Lote from './models/Lote';
import InspeccionFitosanitaria from './models/InspeccionFitosanitaria';
import HallazgoPlaga from './models/HallazgoPlaga';
import AutorizacionEspecie from './models/AutorizacionEspecie';
import Rol from './models/Rol';
import Propietario from './models/Propietario';
import Predio from './models/Predio';
import SolicitudRegistroLugar from './models/SolicitudRegistroLugar';
import SolicitudInspeccion from './models/SolicitudInspeccion';
import catalogModels from './catalogIndex';

const models: any = {
    // Modelos de BD Operacional
    Usuario,
    LugarProduccion,
    Lote,
    InspeccionFitosanitaria,
    HallazgoPlaga,
    AutorizacionEspecie,
    Rol,
    Propietario,
    Predio,
    SolicitudRegistroLugar,
    SolicitudInspeccion
}

Object.values(models).forEach((model: any) => {
    if (model.associate) {
        model.associate(models);
    }
});

export { sequelize };
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

    // Sincronizamos las tablas de la base de datos operacional
    await sequelize.sync({ alter: true });
    console.log('📊 Tablas de BD Operacional sincronizadas');

    // Sincronizamos las tablas del catálogo
    await sequelizeCatalog.sync({ alter: true });
    console.log('📊 Tablas de BD Catalógo sincronizadas');

    // Inyectar roles y usuarios
    await seedRoles();
    await seedAdmins();
    await seedProductores();
    await seedPropietariosYPredios();

    // Solo inyectamos datos geográficos si no hay departamentos en la base de datos
    const count = await catalogModels.Departamento.count();
    if(count === 0) {
        console.log('⚠️  No hay departamentos en la base de datos. Inyectando datos geográficos...');
        await seedGeoData();
    }

    const especieCount = await catalogModels.EspecieVegetal.count();
    if(especieCount === 0) {
        console.log('⚠️  Catalógos de especies vegetales vacíos. Inyectando datos...');
        await seedEspeciesVegetales();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Error crítico al iniciar el servidor:', error);
  }  
};

startServer();

// Aquí se configura el servidor Express, se establece la conexión a la base de datos y se definen las rutas básicas.
// 1. Verificar que hay internet/conexión.
// 2. Sincronizar las tablas (Sequelize Sync).
// 3. Encender el servidor Express.