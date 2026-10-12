// Checks the Gmail SMTP settings from .env and sends a test e-mail to the academy's own address.
// Usage: npm run test:smtp
import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT = '465', SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

if (!SMTP_PASS || SMTP_PASS.startsWith('COLLEZ')) {
  console.error('✗ SMTP_PASS est vide : collez le code de 16 lettres dans .env.');
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s/g, '') },
});

try {
  await transport.verify();
  console.log('✓ Connexion SMTP réussie');
  await transport.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to: SMTP_USER,
    subject: 'Test SMTP — IHEC English Academy',
    text: 'Si vous lisez ce message, l’envoi des e-mails fonctionne.',
  });
  console.log(`✓ E-mail de test envoyé à ${SMTP_USER}`);
} catch (err) {
  console.error('✗ Échec :', err.message);
  process.exit(1);
}
