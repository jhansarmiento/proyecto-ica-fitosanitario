import bcrypt from 'bcrypt';
import models from '../index'; // Tu archivo central de modelos index.ts
import * as dotenv from 'dotenv';

dotenv.config();

export const seedAsistentes = async () => {
    try {
        // 1. Buscamos el rol ASISTENTE 
        const rolAsistente = await models.Rol.findOne({ where: { nombre_rol: 'Asistente Tecnico' } });
        if (!rolAsistente) throw new Error('❌ No se encontró el rol Asistente Tecnico en la base de datos');

        const plainPassword = process.env.DEFAULT_TECNICO_PASSWORD || 'tecnico123';
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        // 2. Definimos los asistentes usando la estructura snake_case de tu nuevo diagrama
        const asistentesParaCrear = [
            {
                ingreso_usuario: 'tecnico_andino',
                numero_identificacion: '11223344',
                nombre: 'Diana Carolina',
                apellidos: 'Mendoza Vega',
                correo_electronico: 'dmendoza@ica.gov.co',
                tarjeta_profesional: 'TP-98765-AGRO',
                direccion: 'Oficina ICA - Regional Centro',
                telefono: '3157778899'
            },
            {
                ingreso_usuario: 'tecnico_oriente',
                numero_identificacion: '55667788',
                nombre: 'Carlos Alberto',
                apellidos: 'Pinto Ruiz',
                correo_electronico: 'cpinto@ica.gov.co',
                tarjeta_profesional: 'TP-43210-AGRO',
                direccion: 'Oficina ICA - Bucaramanga',
                telefono: '3124445566'
            },
            {
                ingreso_usuario: 'tecnico_occidente',
                numero_identificacion: '99887766',
                nombre: 'Laura Valentina',
                apellidos: 'Herrera López',
                correo_electronico: 'lherrera@ica.gov.co',
                tarjeta_profesional: 'TP-56789-AGRO',
                direccion: 'Oficina ICA - Regional Occidente',
                telefono: '3165557788'
            },
            {
                ingreso_usuario: 'tecnico_caribe',
                numero_identificacion: '77441122',
                nombre: 'Jorge Enrique',
                apellidos: 'Ramírez Torres',
                correo_electronico: 'jramirez@ica.gov.co',
                tarjeta_profesional: 'TP-34567-AGRO',
                direccion: 'Oficina ICA - Regional Caribe',
                telefono: '3108889955'
            }
        ];

        console.log('⏳ Precargando asistentes técnicos profesionales...');

        for (const asistente of asistentesParaCrear) {
            // 3. Ajustamos las llaves para que coincidan EXACTAMENTE con el modelo Usuario.ts
            await models.Usuario.findOrCreate({
                where: { ingreso_usuario: asistente.ingreso_usuario },
                defaults: {
                    ...asistente,
                    ingreso_contrasena: passwordHash,
                    id_rol: rolAsistente.id_rol // Asegúrate de usar el nombre exacto de la PK de tu tabla Rol
                }
            });
        }

        console.log('✅ Precarga de asistentes técnicos completada con éxito.');

    } catch (error) {
        console.error('❌ Error en la precarga de asistentes:', error);
    }
};