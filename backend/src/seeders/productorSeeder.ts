import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import Rol from '../models/Rol';
import * as dotenv from 'dotenv';

dotenv.config();

export const seedProductores = async () => {
    try {
        // 1. Buscamos el rol PRODUCTOR
        const rolProductor = await Rol.findOne({ where: { nombre_rol: 'PRODUCTOR' } });
        if (!rolProductor) throw new Error('❌ No se encontró el rol PRODUCTOR');

        const plainPassword = process.env.DEFAULT_PROD_PASSWORD || 'productor123';
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        // 2. Definimos los 3 productores (Asegúrate que los nombres coincidan con Usuario.ts)
        const productoresParaCrear = [
            {
                ingreso_usuario: 'prod_valle_del_cauca',
                numero_identificacion: '123456780',
                nombre: 'Carlos',
                apellidos: 'Restrepo',
                correo_electronico: 'crestrepo@finca.com',
                direccion: 'Vereda La Suiza'
            },
            {
                ingreso_usuario: 'prod_cundinamarca',
                numero_identificacion: '123456781',
                nombre: 'Elena',
                apellidos: 'Gómez',
                correo_electronico: 'egomez@agromundo.co',
                direccion: 'Finca El Paraíso'
            },
            {
                ingreso_usuario: 'prod_atlantico',
                numero_identificacion: '123456782',
                nombre: 'Samuel',
                apellidos: 'Paz',
                correo_electronico: 'spaz@cultivos.com',
                direccion: 'Hacienda La Unión'
            },
            {
                ingreso_usuario: 'prod_santander',
                numero_identificacion: '123456783',
                nombre: 'Gabriel',
                apellidos: 'Fernandez',
                correo_electronico: 'gfernandez@agromundo.co',
                direccion: 'Finca Hacienda El Edén'
            },
            {
                ingreso_usuario: 'prod_antioquia',
                numero_identificacion: '123456784',
                nombre: 'Jesus',
                apellidos: 'Garcia',
                correo_electronico: 'jgarcia@agromundo.co',
                direccion: 'Finca El Parnaso'
            },
        ];

        console.log('⏳ Inyectando productores...');

        for (const prodData of productoresParaCrear) {
            const [user, created] = await Usuario.findOrCreate({
                where: { ingreso_usuario: prodData.ingreso_usuario },
                defaults: {
                    ...prodData,
                    ingreso_contrasena: passwordHash,
                    id_rol: rolProductor.id_rol,
                    telefono: '3100000000'
                }
            });

            if (created) {
                console.log(`🚜 Productor [${prodData.ingreso_usuario}] creado con éxito.`);
            }
        }
        
        console.log('✅ Proceso de inyección de productores finalizado.');

    } catch (error) {
        console.error('❌ Error en el seed de productores:', error);
    }
};