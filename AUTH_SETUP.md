# Configuración del acceso con Google

La aplicación solo acepta cuentas verificadas que terminen exactamente en
`@laolabuena.com`.

## 1. Crear las credenciales en Google Cloud

En Google Cloud Console:

1. Configura la paLOBntalla de consentimiento OAuth.
2. Crea un cliente OAuth de tipo **Aplicación web**.
3. Añade estos URI de redirección autorizados:
   - Desarrollo: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://TU-DOMINIO/api/auth/callback/google`
4. Si la aplicación OAuth es de tipo "Interna", selecciona la organización de
   Google Workspace de La Ola Buena.

## 2. Configurar las variables

Copia `.env.example` como `.env.local` y completa:

```env
AUTH_SECRET="un-secreto-largo-y-aleatorio"
AUTH_GOOGLE_ID="tu-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="tu-client-secret"
```

Puedes generar `AUTH_SECRET` ejecutando:

```bash
npx auth secret
```

En Vercel, añade las mismas tres variables en **Settings > Environment
Variables** y vuelve a desplegar el proyecto.

## Controles de acceso incluidos

- Google recibe `laolabuena.com` como dominio corporativo esperado.
- El servidor exige que Google confirme que el correo está verificado.
- El servidor rechaza cualquier correo que no termine exactamente en
  `@laolabuena.com`.
- Las APIs para generar y subir contratos verifican la sesión de nuevo.
