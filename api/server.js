import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500', // Para Live Server
    'https://tu-dominio.com'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Función principal de envío de correos (misma lógica que Vercel)
async function sendEmailHandler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método no permitido',
      success: false 
    });
  }

  try {
    // Extraer datos del formulario
    const { nombre, correoElectronico, numeroTelefono, mensaje } = req.body;

    // Validar campos requeridos
    if (!nombre || !correoElectronico || !mensaje) {
      return res.status(400).json({
        error: 'Los campos nombre, correo electrónico y mensaje son obligatorios',
        success: false
      });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoElectronico)) {
      return res.status(400).json({
        error: 'Formato de correo electrónico inválido',
        success: false
      });
    }

    // Verificar variables de entorno
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        error: 'Variables de entorno EMAIL_USER y EMAIL_PASS son requeridas',
        success: false
      });
    }

    // Configurar transportador de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'outlook', // Puedes cambiar por 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER, // Tu correo
        pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación
      }
    });

    // Configurar el correo a enviar
    const mailOptions = {
      from: `"Formulario de Contacto [LOCAL]" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER, // A quién enviar
      replyTo: correoElectronico, // Para poder responder directamente
      subject: `[LOCAL] Nuevo mensaje de contacto - ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            📧 Nuevo Mensaje de Contacto [DESARROLLO LOCAL]
          </h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 15px;">Información del Cliente:</h3>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 8px 0;"><strong>👤 Nombre:</strong> ${nombre}</p>
              <p style="margin: 8px 0;"><strong>📧 Correo Electrónico:</strong> 
                <a href="mailto:${correoElectronico}" style="color: #007bff; text-decoration: none;">${correoElectronico}</a>
              </p>
              ${numeroTelefono ? `<p style="margin: 8px 0;"><strong>📱 Teléfono:</strong> 
                <a href="tel:${numeroTelefono}" style="color: #007bff; text-decoration: none;">${numeroTelefono}</a>
              </p>` : ''}
            </div>
            
            <h3 style="color: #555; margin-bottom: 15px;">💬 Mensaje:</h3>
            <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #007bff; border-radius: 0 5px 5px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="line-height: 1.6; color: #333; margin: 0;">${mensaje.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p style="background: #fff3cd; padding: 5px; border-radius: 3px; color: #856404;">
              ⚠️ Este correo fue enviado desde DESARROLLO LOCAL
            </p>
            <p>Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Mexico_City' })}</p>
          </div>
        </div>
      `,
      // Versión en texto plano como respaldo
      text: `
        [DESARROLLO LOCAL] Nuevo mensaje de contacto
        
        Nombre: ${nombre}
        Correo Electrónico: ${correoElectronico}
        ${numeroTelefono ? `Teléfono: ${numeroTelefono}` : ''}
        
        Mensaje:
        ${mensaje}
        
        Enviado el: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Mexico_City' })}
      `
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Correo enviado exitosamente desde desarrollo local',
      messageId: info.messageId,
      environment: 'development'
    });

  } catch (error) {
    console.error('Error al enviar correo:', error);
    
    // Respuesta de error
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al enviar el correo',
      details: error.message, // En desarrollo mostramos el error completo
      environment: 'development'
    });
  }
}

// Rutas
app.post('/api/send-email', sendEmailHandler);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Email Backend funcionando en desarrollo local',
    endpoints: {
      'POST /api/send-email': 'Enviar correo'
    },
    environment: 'development',
    port: PORT
  });
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/send-email'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor iniciado en modo desarrollo`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api/send-email`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log(`\n⚡ Para probar, envía POST a /api/send-email`);
  console.log(`\n📝 Variables de entorno necesarias:`);
  console.log(`   EMAIL_USER=${process.env.EMAIL_USER ? '✅ configurado' : '❌ falta'}`);
  console.log(`   EMAIL_PASS=${process.env.EMAIL_PASS ? '✅ configurado' : '❌ falta'}`);
  console.log(`   EMAIL_RECIPIENT=${process.env.EMAIL_RECIPIENT ? '✅ configurado' : '⚠️  opcional'}`);
});