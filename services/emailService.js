const transporter = require('../config/emailTransporter');

// Send Email
exports.sendEmail = async (email, subject, content, type) => {
  let emailHtml;

  if (type === "verifyOTP") {
    emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #e0f2f1; text-align: center;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; 
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: left;">
          
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dttramgf1/image/upload/v1746507751/medAiLogo_fvbnel.jpg" 
                 alt="Medical Logbook Logo" width="50" style="margin-right: 10px;">
            <h2 style="font-style: italic; color: #00695c; margin: 0; line-height: 50px;">Medical Logbook</h2>
          </div>

          <h2 style="color: #00695c; text-align: center;">Verify Your Email</h2>
          <p style="color: #555; font-size: 16px; text-align: center;">
            Please use the OTP below to verify your email:
          </p>

          <div style="width: 100%; display: flex; justify-content: center; margin: 20px 0;">
            <div style="padding: 15px 25px; font-size: 24px; font-weight: bold; color: #ffffff; background: #00897b; 
                        border-radius: 8px; text-align: center;">
              ${content}
            </div>
          </div>

          <p style="color: #555; font-size: 14px; text-align: center;">
            This OTP will expire shortly. If you did not request this, please ignore the email.
          </p>

          <a href="mailto:medicalsupport@example.com" 
             style="display: block; text-align: center; margin-top: 15px; color: #00897b; font-size: 14px; text-decoration: none;">
            Need help? Contact Support
          </a>

          <footer style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">
            <p>&copy; ${new Date().getFullYear()} Medical Logbook. All rights reserved.</p>
          </footer>

        </div>
      </div>
    `;
  } else if (type === "resetPassword") {
    emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f1f8e9; text-align: center;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; 
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: left;">
          
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dttramgf1/image/upload/v1746507751/medAiLogo_fvbnel.jpg" 
                 alt="Medical Logbook Logo" width="50" style="margin-right: 10px;">
            <h2 style="font-style: italic; color: #33691e; margin: 0; line-height: 50px;">Medical Logbook</h2>
          </div>
  
          <h2 style="color: #33691e; text-align: center;">Reset Your Password</h2>
          <p style="color: #555; font-size: 16px; text-align: center;">
            Click the button below to reset your password:
          </p>
  
          <div style="width: 100%; display: flex; justify-content: center; margin: 20px 0;">
            <a href="${content}" target="_blank" 
               style="padding: 12px 25px; background-color: #558b2f; color: white; text-decoration: none; 
                      border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
          </div>
  
          <p style="color: #777; font-size: 14px; text-align: center;">
            If you didn’t request this, you can safely ignore this email.
          </p>
  
          <footer style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">
            <p>&copy; ${new Date().getFullYear()} Medical Logbook. All rights reserved.</p>
          </footer>
  
        </div>
      </div>
    `;
  }  else if (type === "verifyOTPWithPassword") {
    emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f3f3; text-align: center;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: left;">

          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dttramgf1/image/upload/v1746507751/medAiLogo_fvbnel.jpg" 
                 alt="Medical Logbook Logo" width="50" style="margin-right: 10px;">
            <h2 style="font-style: italic; color: #004d40; margin: 0;">Medical Logbook</h2>
          </div>

          <h2 style="color: #00695c;">Verify Your Email & Password</h2>
          <p style="font-size: 16px; color: #333;">Use the OTP below to verify your email:</p>
          <div style="padding: 12px 24px; font-size: 22px; font-weight: bold; color: white; background-color: #00897b; border-radius: 6px; display: inline-block;">
            ${content.otp}
          </div>

          <p style="margin-top: 20px; font-size: 16px; color: #333;">Here is your system-generated password:</p>
          <div style="padding: 12px 24px; font-size: 20px; font-weight: bold; color: white; background-color: #1976d2; border-radius: 6px; display: inline-block;">
            ${content.password}
          </div>

          <p style="margin-top: 20px; font-size: 14px; color: #888;">Use this password to log in once your email is verified and your account is approved.</p>

          <footer style="margin-top: 20px; font-size: 12px; color: #aaa;">&copy; ${new Date().getFullYear()} Medical Logbook. All rights reserved.</footer>
        </div>
      </div>
    `;
  }
  else if (type === "sendPassword") {
  emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f3f3; text-align: center;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; 
                  box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: left;">

        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <img src="https://res.cloudinary.com/dttramgf1/image/upload/v1746507751/medAiLogo_fvbnel.jpg" 
               alt="Medical Logbook Logo" width="50" style="margin-right: 10px;">
          <h2 style="font-style: italic; color: #004d40; margin: 0;">Medical Logbook</h2>
        </div>

        <h2 style="color: #00695c;">Welcome to Medical Logbook</h2>
        <p style="font-size: 16px; color: #333;">Here is your system-generated password:</p>
        <div style="padding: 12px 24px; font-size: 20px; font-weight: bold; color: white; background-color: #1976d2; 
                    border-radius: 6px; display: inline-block;">
          ${content.password}
        </div>

        <p style="margin-top: 20px; font-size: 14px; color: #888;">Use this password to log in after verification and approval. We recommend changing it after first login.</p>

        <footer style="margin-top: 20px; font-size: 12px; color: #aaa;">
          &copy; ${new Date().getFullYear()} Medical Logbook. All rights reserved.
        </footer>
      </div>
    </div>
  `;
}

  try {
    const mailOptions = {
      from: `"Medical Logbook" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
