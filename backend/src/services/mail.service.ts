/**
 * Servicio de correo para envío de recuperación de contraseña.
 * Usa SMTP configurable por variables de entorno.
 */
import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || 'false') === 'true';
const smtpUser = (process.env.SMTP_USER || '').trim();
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const mailFrom = process.env.MAIL_FROM || `FitoGestor <${smtpUser}>`;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export const sendPasswordResetEmail = async (to: string, resetUrl: string): Promise<void> => {
  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP_USER/SMTP_PASS no configurados correctamente en variables de entorno');
  }
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
      <h2 style="margin:0 0 12px;">FitoGestor - Recuperación de contraseña</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>
        Haz clic en el siguiente botón para continuar:
      </p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="background:#10b981;color:#fff;padding:10px 16px;text-decoration:none;border-radius:8px;display:inline-block;">
          Restablecer contraseña
        </a>
      </p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      <p>Este enlace expira en 30 minutos y es de un solo uso.</p>
    </div>
  `;

  await transporter.sendMail({
    from: mailFrom,
    to,
    subject: 'Recuperación de contraseña - FitoGestor',
    html,
  });
};
