# TODO - Forgot/Reset Password funcional (sin JWT)

- [x] Backend: crear modelo Sequelize `PasswordResetToken`.
- [x] Backend: ampliar `auth.controller.ts` con:
  - [x] `forgotPassword` (token seguro + hash + expiración).
  - [x] `resetPassword` (validar token + actualizar contraseña + marcar usado).
- [x] Backend: registrar endpoints en `auth.routes.ts`.
- [x] Frontend: ampliar `auth.service.ts` con:
  - [x] `forgotPassword`
  - [x] `resetPassword`
- [x] Frontend: hacer funcional `ForgotPasswordModal.tsx` (submit real con estados).
- [x] Frontend: crear `ResetPasswordPage.tsx`.
- [ ] Frontend: agregar ruta de reset en `App.tsx`.
- [x] Documentar archivos creados/editados y flujo final.
- [ ] Backend: integrar envío real de correo SMTP (Nodemailer) en forgot-password.
- [ ] Probar flujo crítico de envío real + reset.
