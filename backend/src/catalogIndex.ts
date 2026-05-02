import sequelizeCatalog, { checkConnectionCatalog } from './config/database_catalog';

// Modelos de BD Catalógo
import EspecieVegetal from './models/EspecieVegetal';
import VariedadEspecie from './models/VariedadEspecie';
import Plaga from './models/Plaga';
import Departamento from './models/Departamento';
import Municipio from './models/Municipio';
import Vereda from './models/Vereda';

const catalogModels = {
    // Modelos de BD Catalógo
    EspecieVegetal,
    VariedadEspecie,
    Plaga,
    Departamento,
    Municipio,    
    Vereda
}

export { sequelizeCatalog };
export default catalogModels;