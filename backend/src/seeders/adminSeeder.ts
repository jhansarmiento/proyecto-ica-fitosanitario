import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import Rol from '../models/Rol';
import * as dotenv from 'dotenv';

dotenv.config();

export const seedAdmins = async () => {
    try {
        const rolAdmin = await Rol.findOne({ where: { nombre_rol: 'Administrador' } });
        if (!rolAdmin) throw new Error('❌ No se encontró el rol Administrador en la DB');

        const plainPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const adminsParaCrear = [
            {
                ingreso_usuario: 'admin_central',
                numero_identificacion: '123456789',
                nombre: 'Administrador',
                apellidos: 'Central',
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
                correo_electronico: 'vargas0799@gmail.com',
            },
        ];

        console.log('⏳ Inyectando administradores...');

        for (const adminData of adminsParaCrear) {
            const [, created] = await Usuario.findOrCreate({
                where: { ingreso_usuario: adminData.ingreso_usuario },
                defaults: {
                    ...adminData,
                    ingreso_contrasena: passwordHash,
                    id_rol: rolAdmin.id_rol,
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
        console.error('❌ Error en el seed de administradores:', error);
    }
};
