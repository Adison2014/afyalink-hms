const pool = require('../config/db');

exports.getMessages = async (req, res) => {
  const { recipient_id, type, is_read } = req.query;
  const authenticatedUserId = req.user.id;
  let query = 'SELECT * FROM messages WHERE recipient_id = $1';
  const queryParams = [recipient_id || authenticatedUserId];
  let paramIndex = 2;

  if (type) {
    query += ` AND type = $${paramIndex++}`;
    queryParams.push(type);
  }

  if (is_read !== undefined) {
    query += ` AND is_read = $${paramIndex++}`;
    queryParams.push(is_read === 'true');
  }

  query += ' ORDER BY created_at DESC';

  try {
    const { rows } = await pool.query(query, queryParams);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching messages:', error.stack);
    res.status(500).json({ message: 'Server error fetching messages.' });
  }
};

exports.createMessage = async (req, res) => {
  const { sender_id, recipient_id, type, content, reference_id } = req.body;

  if (!recipient_id || !type || !content) {
    return res.status(400).json({ message: 'Recipient, type, and content are required for a message.' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, type, content, reference_id, is_read) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING *',
      [sender_id || null, recipient_id, type, content, reference_id || null]
    );
    res.status(201).json({ message: 'Message created successfully.', message: rows[0] });
  } 
  catch (error) {
    console.error('Error creating message:', error.stack);
    res.status(500).json({ message: 'Server error creating message.' });
  }
};

exports.markMessageAsRead = async (req, res) => {
  const { id } = req.params;
  const authenticatedUserId = req.user.id;

  try {
    const { rows } = await pool.query(
      'UPDATE messages SET is_read = TRUE, updated_at = NOW() WHERE id = $1 AND recipient_id = $2 RETURNING *',
      [id, authenticatedUserId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Message not found or you do not have permission to update it.' });
    }
    res.status(200).json({ message: 'Message marked as read.', message: rows[0] });
  } catch (error) {
    console.error('Error marking message as read:', error.stack);
    res.status(500).json({ message: 'Server error marking message as read.' });
  }
};

exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  const authenticatedUserId = req.user.id;

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM messages WHERE id = $1 AND (recipient_id = $2 OR (SELECT role FROM users WHERE id = $2) = \'admin\')',
      [id, authenticatedUserId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Message not found or you do not have permission to delete it.' });
    }
    res.status(200).json({ message: 'Message deleted successfully.' });
  } 
  catch (error) {
    console.error('Error deleting message:', error.stack);
    res.status(500).json({ message: 'Server error deleting message.' });
  }
};