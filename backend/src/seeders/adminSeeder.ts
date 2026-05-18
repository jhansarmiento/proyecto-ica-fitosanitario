import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import Rol from '../models/Rol';
import * as dotenv from 'dotenv';

dotenv.config();

export const seedAdmins = async () => {
    try {
        // 1. Corregimos el nombre del campo: de nombre_rol a nombreRol
        const rolAdmin = await Rol.findOne({ where: { nombre_rol: 'ADMIN' } });
        if (!rolAdmin) throw new Error('❌ No se encontró el rol ADMIN en la DB');

        const plainPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        // 2. Ajustamos las llaves para que coincidan EXACTAMENTE con el modelo Usuario.ts
        const adminsParaCrear = [
            {
                ingreso_usuario: 'admin_central',
                numero_identificacion: '123456789',
                nombre: 'Admin', // En tu modelo es 'nombre' (singular)
                apellidos: 'Principal',
                correo_electronico: 'admin@ica.gov.co',
            },
            {
                ingreso_usuario: 'admin_santander', 
                numero_identificacion: '987654321',
                nombre: 'Jhan',
                apellidos: 'Sarmiento',
                correo_electronico: 'jsarmiento@ica.gov.co',
            },
            {
                ingreso_usuario: 'admin_antioquia', 
                numero_identificacion: '109283746',
                nombre: 'Ricardo',
                apellidos: 'Vargas',
                correo_electronico: 'rvargas@ica.gov.co',
            },
        ];

        console.log('⏳ Inyectando administradores...');

        for (const adminData of adminsParaCrear) {
            // Buscamos por ingreso_usuario (que es el nombre del atributo en el modelo)
            const [user, created] = await Usuario.findOrCreate({
                where: { ingreso_usuario: adminData.ingreso_usuario },
                defaults: {
                    ...adminData,
                    ingreso_contrasena: passwordHash, // Nombre correcto del modelo
                    id_rol: rolAdmin.id_rol,              // Nombre correcto del modelo
                    direccion: 'Sede Regional',
                    telefono: '601000001'
                }
            });

            if (created) {
                console.log(`👤 Usuario [${adminData.ingreso_usuario}] creado con éxito.`);
            }
        }
        
        console.log('✅ Proceso de inyección de administradores finalizado.');

    } catch (error) {
        // Deberíamos para ver qué campo está fallando si hay un error
        console.error('❌ Error en el seed de administradores:', error);
    }
};