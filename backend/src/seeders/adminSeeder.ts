import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import Rol from '../models/Rol';
import * as dotenv from 'dotenv';

dotenv.config();

export const seedAdmins = async () => {
    try {
        // 1. Corregimos el nombre del campo: de nombre_rol a nombreRol
        const rolAdmin = await Rol.findOne({ where: { nombreRol: 'ADMIN' } });
        if (!rolAdmin) throw new Error('❌ No se encontró el rol ADMIN en la DB');

        const plainPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        // 2. Ajustamos las llaves para que coincidan EXACTAMENTE con el modelo Usuario.ts
        const adminsParaCrear = [
            {
                ingresoUsuario: 'admin_central',
                numeroIdentificacion: '123456789',
                nombre: 'Admin', // En tu modelo es 'nombre' (singular)
                apellidos: 'Principal',
                correoElectronico: 'admin@ica.gov.co',
            },
            {
                ingresoUsuario: 'admin_santander', 
                numeroIdentificacion: '987654321',
                nombre: 'Jhan',
                apellidos: 'Sarmiento',
                correoElectronico: 'jsarmiento@ica.gov.co',
            },
            {
                ingresoUsuario: 'admin_antioquia', 
                numeroIdentificacion: '109283746',
                nombre: 'Ricardo',
                apellidos: 'Vargas',
                correoElectronico: 'rvargas@ica.gov.co',
            },
        ];

        console.log('⏳ Verificando e inyectando administradores...');

        for (const adminData of adminsParaCrear) {
            // Buscamos por ingresoUsuario (que es el nombre del atributo en el modelo)
            const [user, created] = await Usuario.findOrCreate({
                where: { ingresoUsuario: adminData.ingresoUsuario },
                defaults: {
                    ...adminData,
                    ingresoContrasena: passwordHash, // Nombre correcto del modelo
                    idRol: rolAdmin.id,              // Nombre correcto del modelo
                    direccion: 'Sede Regional',
                    telefono: '601000001'
                }
            });

            if (created) {
                console.log(`👤 Usuario [${adminData.ingresoUsuario}] creado con éxito.`);
            }
        }
        
        console.log('✅ Proceso de seed de administradores finalizado.');

    } catch (error) {
        // Deberíamos para ver qué campo está fallando si hay un error
        console.error('❌ Error en el seed de administradores:', error);
    }
};