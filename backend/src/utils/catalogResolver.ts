import catalogModels from '../catalogIndex';


export const CatalogBridge = {
    // Puente para validar la existencia de una vereda en el catálogo
    async validarVereda(idVereda: string) {
        const vereda = await catalogModels.Vereda.findByPk(idVereda);
        return !!vereda; // Retorna true si la vereda existe, false si no
    },
    // Puente para plagas
    async obtenerPlaga(idPlaga: string) {
        return await catalogModels.Plaga.findByPk(idPlaga);
    },

    // Puente para variedades
    async obtenerVariedad(idVariedad: string) {
        return await catalogModels.VariedadEspecie.findByPk(idVariedad);
    },

    // Puente para especies vegetales
    async obtenerEspecieVegetal(idEspecieVegetal: string) {
        return await catalogModels.EspecieVegetal.findByPk(idEspecieVegetal);
    }
}