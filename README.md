# Backend para Envío de Correos 📧

Backend serverless para envío de correos desde formularios de contacto, optimizado para Vercel.

## 🚀 Características

- ✅ Validación de campos obligatorios
- ✅ Validación de formato de email
- ✅ Correos HTML con diseño responsive
- ✅ Soporte CORS configurado
- ✅ Manejo de errores completo
- ✅ Campo de teléfono opcional

## 📋 Campos del Formulario

- **nombre** (obligatorio)
- **correoElectronico** (obligatorio)
- **numeroTelefono** (opcional)
- **mensaje** (obligatorio)

## 🛠️ Configuración

### 1. Variables de Entorno en Vercel

```bash
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_RECIPIENT=destinatario@gmail.com
```

### 2. Configurar Gmail

1. Activa la **verificación en 2 pasos** en Gmail
2. Ve a: **Configuración → Seguridad → Contraseñas de aplicaciones**
3. Genera una nueva contraseña para "Correo"
4. Usa esta contraseña en `EMAIL_PASS`

### 3. CORS

Edita el array `allowedOrigins` en `api/send-email.js`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://tu-sitio-web.com',
  'https://www.tu-sitio-web.com'
];
```

## 📡 Uso de la API

### Endpoint
```
POST /api/send-email
```

### Ejemplo con fetch

```javascript
const response = await fetch('https://tu-backend.vercel.app/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nombre: 'Juan Pérez',
    correoElectronico: 'juan@ejemplo.com',
    numeroTelefono: '+52 123 456 7890', // Opcional
    mensaje: '¡Hola! Me gustaría obtener más información...'
  })
});

const data = await response.json();
console.log(data);
```

### Ejemplo con formulario HTML

```html
<form id="contactForm">
  <input type="text" name="nombre" placeholder="Nombre completo" required>
  <input type="email" name="correoElectronico" placeholder="Email" required>
  <input type="tel" name="numeroTelefono" placeholder="Teléfono (opcional)">
  <textarea name="mensaje" placeholder="Tu mensaje" required></textarea>
  <button type="submit">Enviar</button>
</form>

<script>
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('¡Mensaje enviado exitosamente!');
      e.target.reset();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Error de conexión');
  }
});
</script>
```

## 🚀 Deploy en Vercel

### Método 1: GitHub + Vercel (Recomendado)
1. Sube este proyecto a GitHub
2. Conecta tu repositorio con Vercel
3. Configura las variables de entorno
4. ¡Deploy automático!

### Método 2: Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📋 Respuestas de la API

### Éxito (200)
```json
{
  "success": true,
  "message": "Correo enviado exitosamente",
  "messageId": "mensaje-id-único"
}
```

### Error de validación (400)
```json
{
  "success": false,
  "error": "Los campos nombre, correo electrónico y mensaje son obligatorios"
}
```

### Error del servidor (500)
```json
{
  "success": false,
  "error": "Error interno del servidor al enviar el correo"
}
```

## 🔧 Personalización

### Cambiar proveedor de email
```javascript
// Para Outlook/Hotmail
service: 'outlook'

// Para Yahoo
service: 'yahoo'

// Para servicios personalizados
host: 'smtp.tu-proveedor.com',
port: 587,
secure: false,
```

## 🛡️ Seguridad incluida

- ✅ Validación de entrada
- ✅ CORS configurado
- ✅ Variables de entorno seguras
- ✅ Rate limiting por Vercel
- ✅ Sanitización de HTML

## 📞 Soporte

Si necesitas ayuda adicional o personalización, no dudes en preguntar.
