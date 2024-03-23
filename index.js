const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Dummy database to store reset tokens
const resetTokens = {};

// Configuration for nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_password',
  },
});

// API endpoint for forgot password
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  // Check if user exists in the database (pseudo-code)
  if (!userExists(email)) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate random token
  const token = crypto.randomBytes(20).toString('hex');
  resetTokens[token] = email;

  // Send reset link to the user's email
  const resetLink = `http://yourdomain.com/reset-password/${token}`;
  const mailOptions = {
    from: 'your_email@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click on the link to reset your password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: 'Failed to send reset link' });
    }
    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Reset link sent successfully' });
  });
});

// API endpoint for resetting password
app.post('/api/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  const email = resetTokens[token];

  if (!email) {
    return res.status(404).json({ message: 'Invalid or expired token' });
  }

  // Update password in the database (pseudo-code)
  updateUserPassword(email, newPassword);
  
  delete resetTokens[token];

  return res.status(200).json({ message: 'Password reset successfully' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
