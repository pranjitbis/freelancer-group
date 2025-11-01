import nodemailer from "nodemailer";

class HostingerEmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    try {
      // Check if Hostinger credentials are available
      if (
        !process.env.EMAIL_HOST ||
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASS
      ) {
        console.log("❌ Hostinger email credentials not found");
        console.log(
          "📝 Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env.local"
        );
        await this.initEthereal(); // Fallback to Ethereal
        return;
      }

      console.log("🔄 Initializing Hostinger email service...");
      console.log("📧 Using email:", process.env.EMAIL_USER);
      console.log("🌐 SMTP Host:", process.env.EMAIL_HOST);
      console.log("🔐 Port:", process.env.EMAIL_PORT);

      const port = parseInt(process.env.EMAIL_PORT) || 587;
      const secure = process.env.EMAIL_SECURE === "true";

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: port,
        secure: secure, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        // Additional settings for better compatibility
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log("✅ Hostinger email service initialized and verified!");
      console.log("✅ Ready to send real emails via Hostinger!");
      this.isInitialized = true;
    } catch (error) {
      console.error("❌ Hostinger initialization failed:", error.message);

      if (error.code === "EAUTH") {
        console.log("🔑 Authentication failed. Please check:");
        console.log("1. Email and password are correct");
        console.log("2. SMTP settings in Hostinger");
        console.log("3. Port configuration (587 for TLS, 465 for SSL)");
      }

      // Fallback to Ethereal
      await this.initEthereal();
    }
  }

  async initEthereal() {
    try {
      console.log("🔄 Falling back to Ethereal email service...");

      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      await this.transporter.verify();

      console.log("✅ Ethereal email service initialized");
      console.log("📧 Ethereal Email:", testAccount.user);
      console.log("🔑 Ethereal Password:", testAccount.pass);
      console.log("🌐 View emails at: https://ethereal.email/");

      this.isInitialized = true;
    } catch (error) {
      console.error("❌ Ethereal initialization failed:", error.message);
      this.isInitialized = false;
    }
  }

  async waitForInitialization() {
    if (!this.isInitialized) {
      await this.initPromise;
    }
    return this.isInitialized;
  }

  async sendOTP(to, otp) {
    const isReady = await this.waitForInitialization();

    if (!isReady || !this.transporter) {
      throw new Error("Email service is not ready. Please try again.");
    }

    try {
      const fromEmail = process.env.EMAIL_USER
        ? `"Your App" <${process.env.EMAIL_USER}>`
        : '"Your App" <noreply@yourapp.com>';

      const mailOptions = {
        from: fromEmail,
        to: to,
        subject: "Password Reset OTP - Your App",
        html: this.generateOTPEmailTemplate(otp),
      };

      console.log("📤 Sending email to:", to);

      const info = await this.transporter.sendMail(mailOptions);

      // Check if we're using Hostinger or Ethereal
      const usingHostinger = !!process.env.EMAIL_HOST;

      if (usingHostinger) {
        console.log("✅ Hostinger email sent successfully to:", to);
        console.log("📨 Message ID:", info.messageId);
      } else {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("✅ Ethereal email sent! Preview URL:", previewUrl);
      }

      console.log("🔑 OTP:", otp);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: !usingHostinger ? nodemailer.getTestMessageUrl(info) : null,
        isRealEmail: usingHostinger,
        service: usingHostinger ? "hostinger" : "ethereal",
      };
    } catch (error) {
      console.error("❌ Email sending failed:", error.message);

      let userMessage = "Failed to send email";
      if (error.code === "EAUTH") {
        userMessage =
          "Email authentication failed. Please check your Hostinger email credentials.";
      } else if (error.code === "ECONNECTION") {
        userMessage =
          "Cannot connect to email server. Please check your SMTP settings.";
      }

      throw new Error(userMessage);
    }
  }

  generateOTPEmailTemplate(otp) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
          <style>
              body { 
                  margin: 0; 
                  padding: 20px; 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  background: #f6f9fc;
              }
              .container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  background: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
              }
              .header { 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  padding: 40px 30px; 
                  text-align: center; 
                  color: white; 
              }
              .header h1 { 
                  margin: 0; 
                  font-size: 28px;
                  font-weight: 700;
              }
              .content { 
                  padding: 40px 30px; 
                  color: #333;
                  line-height: 1.6;
              }
              .otp-container { 
                  text-align: center; 
                  margin: 40px 0; 
              }
              .otp-code { 
                  font-size: 42px; 
                  font-weight: 800; 
                  letter-spacing: 10px; 
                  color: #667eea; 
                  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                  padding: 25px 35px; 
                  border-radius: 16px; 
                  display: inline-block;
                  border: 3px solid #e9ecef;
                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
                  font-family: 'Courier New', monospace;
              }
              .warning { 
                  background: #fff3cd; 
                  border: 2px solid #ffeaa7; 
                  border-radius: 12px; 
                  padding: 20px; 
                  margin: 30px 0; 
                  color: #856404;
                  font-weight: 500;
              }
              .footer { 
                  margin-top: 40px; 
                  padding-top: 30px; 
                  border-top: 2px solid #f1f3f4; 
                  color: #666; 
                  font-size: 14px; 
                  text-align: center;
              }
              .info-box {
                  background: #e8f4fd;
                  border: 2px solid #bee5eb;
                  border-radius: 12px;
                  padding: 20px;
                  margin: 20px 0;
                  color: #0c5460;
              }
              @media (max-width: 600px) {
                  body {
                      padding: 10px;
                  }
                  .container {
                      border-radius: 8px;
                  }
                  .header { 
                      padding: 30px 20px; 
                  }
                  .content { 
                      padding: 30px 20px; 
                  }
                  .otp-code { 
                      font-size: 32px; 
                      letter-spacing: 8px; 
                      padding: 20px 25px; 
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🔐 Password Reset</h1>
              </div>
              <div class="content">
                  <p>Hello,</p>
                  <p>You requested to reset your password. Use the following verification code to proceed:</p>
                  
                  <div class="otp-container">
                      <div class="otp-code">${otp}</div>
                  </div>
                  
                  <div class="info-box">
                      <strong>⏰ Code Expires:</strong> 10 minutes<br>
                      <strong>📱 Enter this code in:</strong> Your app's password reset page
                  </div>
                  
                  <div class="warning">
                      <strong>⚠️ Security Notice:</strong> This code is confidential. Never share it with anyone. Our team will never ask for this code.
                  </div>
                  
                  <p>If you didn't request this password reset, please ignore this email. Your account security is not compromised.</p>
                  
                  <div class="footer">
                      <p>Need assistance? <a href="mailto:support@yourapp.com" style="color: #667eea; text-decoration: none; font-weight: 600;">Contact Support</a></p>
                      <p>Best regards,<br><strong style="color: #667eea;">The Your App Team</strong></p>
                      <p style="font-size: 12px; color: #999; margin-top: 20px;">
                          This is an automated message. Please do not reply to this email.
                      </p>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
  }
}

const hostingerEmailService = new HostingerEmailService();
export default hostingerEmailService;
