const nodemailer = require("nodemailer");

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send blog status notification
const sendBlogStatusNotification = async (blog) => {
  if (!process.env.EMAIL_USER) {
    console.log("Email service not configured");
    return;
  }

  try {
    const transporter = createTransporter();

    const subject = `Blog ${blog.status}: ${blog.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Blog Status Update</h2>
        <p>Hello ${blog.author.firstName},</p>
        <p>Your blog post "<strong>${blog.title}</strong>" has been <strong>${
      blog.status
    }</strong>.</p>
        ${
          blog.adminNotes
            ? `<p><strong>Admin Notes:</strong> ${blog.adminNotes}</p>`
            : ""
        }
        ${
          blog.status === "approved"
            ? `<p>Congratulations! Your blog is now live and can be viewed by readers.</p>`
            : `<p>Please review the feedback and feel free to make improvements before resubmitting.</p>`
        }
        <p>Best regards,<br>The Devnovate Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Devnovate Blog" <${process.env.EMAIL_USER}>`,
      to: blog.author.email,
      subject,
      html,
    });

    console.log("Blog status notification sent successfully");
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  if (!process.env.EMAIL_USER) {
    console.log("Email service not configured");
    return;
  }

  try {
    const transporter = createTransporter();

    const subject = "Welcome to Devnovate Blog!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Devnovate Blog!</h2>
        <p>Hello ${user.firstName},</p>
        <p>Thank you for joining our community of developers and tech enthusiasts!</p>
        <p>You can now:</p>
        <ul>
          <li>Create and publish blog posts</li>
          <li>Engage with other authors through comments and likes</li>
          <li>Build your profile and showcase your expertise</li>
        </ul>
        <p>Get started by creating your first blog post!</p>
        <p>Happy blogging,<br>The Devnovate Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Devnovate Blog" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject,
      html,
    });

    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

module.exports = {
  sendBlogStatusNotification,
  sendWelcomeEmail,
};
