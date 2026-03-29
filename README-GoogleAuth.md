# Firebase Auth — configuración

Setup del sistema de autenticación de iPlant. Hay dos métodos: correo/contraseña y Google.

---

## Correo y contraseña

Lo más simple. Solo hay que habilitarlo en Firebase Console:

**Firebase Console → Authentication → Sign-in method → Email/Password → activar**

No requiere ninguna configuración extra en el código. Firebase maneja todo.

El flujo en el código es directo:

```ts
// login
signInWithEmailAndPassword(auth, email, password)

// registro — también crea el doc del usuario en Firestore
createUserWithEmailAndPassword(auth, email, password)

// cerrar sesión
signOut(auth)

// recuperar contraseña
sendPasswordResetEmail(auth, email)
```

Persistencia de sesión configurada con AsyncStorage para que el usuario no tenga que volver a iniciar sesión cada vez que abre la app.

---

## Google Sign-In

Un poco más de setup. Requiere Google Cloud Console y el proxy de Expo para funcionar en Expo Go.

### Cuentas y proyectos

- **Expo account:** `kenexpo777`
- **Google Cloud Project:** el mismo que usa Firebase (`812808127843`)

### Clientes OAuth en Google Cloud Console

Hay dos clientes creados en APIs & Services → Credentials:

| Nombre | Tipo | Client ID |
|--------|------|-----------|
| iplant-web | Web application | `812808127843-uph6s3j4bkhm4vemvjsaognr4osa5vh9.apps.googleusercontent.com` |
| iPlant | iOS | `812808127843-hu0rsol6lps0v4nkgdaqpfs5l820fiv5.apps.googleusercontent.com` |

El que se usa en el código es **iplant-web**.

### Redirect URI autorizado (iplant-web)

Dentro del cliente web hay que tener esto en "Authorized redirect URIs":

```
https://auth.expo.io/@kenexpo777/iPlant
```

Sin esto Google rechaza el request con error 400.

### app.json

El campo `owner` tiene que estar definido porque es parte de la URL del proxy:

```json
{
  "expo": {
    "name": "iPlant",
    "slug": "iPlant",
    "owner": "kenexpo777"
  }
}
```

### Cómo funciona el flujo

En Expo Go no se pueden usar esquemas custom (`exp://`) con Google porque los rechaza por seguridad. La solución es el proxy de Expo:

```
app → https://auth.expo.io/@kenexpo777/iPlant/start?authUrl=...&returnUrl=exp://...
       ↓
    proxy redirige a Google
       ↓
    usuario elige cuenta
       ↓
    Google → proxy (con tokens)
       ↓
    proxy → exp://... (Expo Go intercepta)
       ↓
    app recibe access_token → Firebase
```

Firebase recibe el `access_token` de Google y autentica al usuario. Si es la primera vez, crea el documento en Firestore automáticamente.

### Variables en el código

`src/screens/login/Login.tsx`:

```ts
const GOOGLE_WEB_CLIENT_ID = "812808127843-uph6s3j4bkhm4vemvjsaognr4osa5vh9.apps.googleusercontent.com";

redirectUri: "https://auth.expo.io/@kenexpo777/iPlant"
```

---

## Nota para producción

El flujo del proxy es solo para desarrollo con Expo Go. En un build de producción (EAS Build):
- Usar el cliente iOS con el bundle ID real del app
- Registrar el esquema `com.googleusercontent.apps.{client-id}` en app.json
- Quitar la lógica del proxy
