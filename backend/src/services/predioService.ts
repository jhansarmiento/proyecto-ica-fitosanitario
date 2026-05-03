// import Predio from '../models/Predio'; 
// import Vereda from '../models/Vereda';

// export const getPredioCompleto = async(idPredio: string) => {
//     // 1. Buscamos el predio en la BD Operacional
//     const predio = await Predio.findByPk(idPredio);

//     if (!predio) return null;

//     // 2. Usamos el idVereda que guardamos en el predio para buscar la información de la vereda en la BD Catalógo
//     const veredaInfo = await Vereda.findByPk(predio.idVereda);

//     // 3. Combinamos la información del predio con la información de la vereda y la retornamos
//     return {
//         ...predio.toJSON(),
//         vereda: veredaInfo ? veredaInfo.toJSON : null
//     };
// }