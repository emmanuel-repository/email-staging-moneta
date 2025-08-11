import nodemailer from 'nodemailer';

// Configuración CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://tu-dominio.com',
  'https://email-staging-moneta.vercel.app',
  // Agrega aquí los dominios permitidos
];

export default async function handler(req, res) {
  // Configurar CORS
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
      service: 'outlook', // Para correos @gpomagno.com.mx
      auth: {
        user: process.env.EMAIL_USER, // emmanuelrodriguez@gpomagno.com.mx
        pass: process.env.EMAIL_PASS  // wcwgvhtlxfcbftdk
      }
    });

    // Configurar el correo a enviar
    const mailOptions = {
      from: `"Formulario de Contacto GPO Magno" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER, // A quién enviar
      replyTo: correoElectronico, // Para poder responder directamente
      subject: `Nuevo mensaje de contacto - ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            📧 Nuevo Mensaje de Contacto - GPO Magno
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
            <p>Este correo fue enviado desde tu formulario de contacto web</p>
            <p>Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Mexico_City' })}</p>
          </div>
        </div>
      `,
      // Versión en texto plano como respaldo
      text: `
        Nuevo mensaje de contacto - GPO Magno
        
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
      message: 'Correo enviado exitosamente',
      messageId: info.messageId,
      environment: 'production'
    });

  } catch (error) {
    console.error('Error al enviar correo:', error);
    
    // Respuesta de error
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al enviar el correo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      environment: 'production'
    });
  }
}