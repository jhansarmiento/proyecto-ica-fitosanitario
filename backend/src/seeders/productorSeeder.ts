import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import Rol from '../models/Rol';
import * as dotenv from 'dotenv';

dotenv.config();

export const seedProductores = async () => {
    try {
        // 1. Buscamos el rol PRODUCTOR
        const rolProductor = await Rol.findOne({ where: { nombreRol: 'PRODUCTOR' } });
        if (!rolProductor) throw new Error('❌ No se encontró el rol PRODUCTOR');

        const plainPassword = process.env.DEFAULT_PROD_PASSWORD || 'productor123';
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        // 2. Definimos los 3 productores (Asegúrate que los nombres coincidan con Usuario.ts)
        const productoresParaCrear = [
            {
                ingresoUsuario: 'prod_valle_del_cauca',
                numeroIdentificacion: '123456780',
                nombre: 'Carlos',
                apellidos: 'Restrepo',
                correoElectronico: 'crestrepo@finca.com',
                direccion: 'Vereda La Suiza'
            },
            {
                ingresoUsuario: 'prod_cundinamarca',
                numeroIdentificacion: '123456781',
                nombre: 'Elena',
                apellidos: 'Gómez',
                correoElectronico: 'egomez@agromundo.co',
                direccion: 'Finca El Paraíso'
            },
            {
                ingresoUsuario: 'prod_atlantico',
                numeroIdentificacion: '123456782',
                nombre: 'Samuel',
                apellidos: 'Paz',
                correoElectronico: 'spaz@cultivos.com',
                direccion: 'Hacienda La Unión'
            },
            {
                ingresoUsuario: 'prod_santander',
                numeroIdentificacion: '123456783',
                nombre: 'Gabriel',
                apellidos: 'Fernandez',
                correoElectronico: 'gfernandez@agromundo.co',
                direccion: 'Finca Hacienda El Edén'
            },
            {
                ingresoUsuario: 'prod_antioquia',
                numeroIdentificacion: '123456784',
                nombre: 'Jesus',
                apellidos: 'Garcia',
                correoElectronico: 'jgarcia@agromundo.co',
                direccion: 'Finca El Parnaso'
            },
        ];

        console.log('⏳ Inyectando productores...');

        for (const prodData of productoresParaCrear) {
            const [user, created] = await Usuario.findOrCreate({
                where: { ingresoUsuario: prodData.ingresoUsuario },
                defaults: {
                    ...prodData,
                    ingresoContrasena: passwordHash,
                    idRol: rolProductor.id,
                    telefono: '3100000000'
                }
            });

            if (created) {
                console.log(`🚜 Productor [${prodData.ingresoUsuario}] creado con éxito.`);
            }
        }
        
        console.log('✅ Proceso de inyección de productores finalizado.');

    } catch (error) {
        console.error('❌ Error en el seed de productores:', error);
    }
};