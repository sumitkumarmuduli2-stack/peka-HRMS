import ContactMessage from '../models/ContactMessage.js';

// @desc    Submit landing page contact request
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all contact fields' });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Message received successfully',
      data: contactMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
