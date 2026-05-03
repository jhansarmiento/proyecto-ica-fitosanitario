import models from '../index';

export const seedRoles = async () => {
    try {
        const roles = [
            { nombre_rol: 'ADMIN', descripcion: 'Control total del sistema e informes' },
            { nombre_rol: 'PRODUCTOR', descripcion: 'Dueño de lugares de producción y lotes' },
            { nombre_rol: 'ASISTENTE', descripcion: 'Técnico encargado de las inspecciones fitosanitarias' }
        ];

        console.log('⏳ Inyectando roles...');

        for (const r of roles) {
            const [rol] = await models.Rol.findOrCreate({
                where: { 
                    nombreRol: r.nombre_rol 
                },
                defaults: { 
                    descripcion: r.descripcion 
                }
            });
        }

        console.log('✅ Roles listos.');
    } catch (error) {
        console.error('❌ Error al inyectar roles:', error);
    }
};