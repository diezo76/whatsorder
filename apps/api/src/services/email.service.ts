import 'dotenv/config';
import { Resend } from 'resend';

/**
 * Service d'envoi d'emails
 * Utilise Resend pour l'envoi d'emails transactionnels
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface RestaurantConfirmationEmailData {
  restaurantName: string;
  ownerName: string;
  ownerEmail: string;
  restaurantSlug: string;
  dashboardUrl: string;
}

class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@whataybo.com';
    this.baseUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.whataybo.com';
    
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  /**
   * Vérifie si le service email est configuré
   */
  isConfigured(): boolean {
    return this.resend !== null;
  }

  /**
   * Envoie un email via Resend
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Email service not configured. RESEND_API_KEY is missing.');
      console.log('📧 Email would be sent:', {
        to: options.to,
        subject: options.subject,
        from: options.from || this.fromEmail,
      });
      return;
    }

    try {
      const { data, error } = await this.resend!.emails.send({
        from: options.from || this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('✅ Email sent successfully:', data?.id);
    } catch (error: any) {
      console.error('❌ Error sending email:', error.message);
      // Ne pas faire échouer l'inscription si l'email échoue
      throw error;
    }
  }

  /**
   * Génère le template HTML pour l'email de confirmation de création de restaurant
   */
  private generateRestaurantConfirmationTemplate(data: RestaurantConfirmationEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Whataybo</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🍽️ Bienvenue sur Whataybo !</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Bonjour <strong>${data.ownerName}</strong>,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Félicitations ! Votre compte restaurant <strong>${data.restaurantName}</strong> a été créé avec succès sur Whataybo.
    </p>
    
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #25D366; font-size: 20px;">📋 Informations de votre compte</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="margin: 10px 0;"><strong>Restaurant :</strong> ${data.restaurantName}</li>
        <li style="margin: 10px 0;"><strong>Email :</strong> ${data.ownerEmail}</li>
        <li style="margin: 10px 0;"><strong>URL publique :</strong> <a href="${this.baseUrl}/${data.restaurantSlug}" style="color: #25D366;">${this.baseUrl}/${data.restaurantSlug}</a></li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.dashboardUrl}" style="display: inline-block; background: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Accéder au tableau de bord
      </a>
    </div>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px;">
        <strong>💡 Prochaine étape :</strong> Complétez la configuration de votre restaurant en ajoutant votre menu, vos horaires d'ouverture et vos informations de contact.
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Si vous n'avez pas créé ce compte, veuillez ignorer cet email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
      © ${new Date().getFullYear()} Whataybo. Tous droits réservés.
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Envoie un email de confirmation lors de la création d'un compte restaurant
   */
  async sendRestaurantConfirmationEmail(data: RestaurantConfirmationEmailData): Promise<void> {
    const html = this.generateRestaurantConfirmationTemplate(data);
    
    await this.sendEmail({
      to: data.ownerEmail,
      subject: `Bienvenue sur Whataybo - ${data.restaurantName}`,
      html,
    });
  }
}

export const emailService = new EmailService();
