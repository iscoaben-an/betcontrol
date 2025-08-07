const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all bets for current user
router.get('/', auth, async (req, res) => {
  try {
    const bets = await pool.query(
      'SELECT * FROM bets WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ bets: bets.rows });
  } catch (error) {
    console.error('Get bets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new bet
router.post('/', [
  auth,
  body('sport').notEmpty().withMessage('Sport is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('odds').isFloat({ min: 1.0 }).withMessage('Odds must be at least 1.0'),
  body('result').isIn(['pending', 'won', 'lost']).withMessage('Result must be pending, won, or lost')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sport, category, amount, odds, result, description } = req.body;

    // Check if user has enough balance
    const user = await pool.query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.rows[0].balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create bet
    const newBet = await pool.query(
      'INSERT INTO bets (user_id, sport, category, amount, odds, result, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, sport, category, amount, odds, result, description]
    );

    // Update user balance
    await pool.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [amount, req.user.id]
    );

    res.status(201).json({
      message: 'Bet created successfully',
      bet: newBet.rows[0]
    });
  } catch (error) {
    console.error('Create bet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update bet result
router.put('/:id', [
  auth,
  body('result').isIn(['pending', 'won', 'lost']).withMessage('Result must be pending, won, or lost')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { result } = req.body;
    const { id } = req.params;

    // Get the bet
    const bet = await pool.query(
      'SELECT * FROM bets WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (bet.rows.length === 0) {
      return res.status(404).json({ error: 'Bet not found' });
    }

    const currentBet = bet.rows[0];
    const oldResult = currentBet.result;
    const newResult = result;

    // Update bet
    await pool.query(
      'UPDATE bets SET result = $1, updated_at = NOW() WHERE id = $2',
      [result, id]
    );

    // Handle balance updates based on result changes
    if (oldResult === 'pending' && newResult === 'won') {
      const winnings = currentBet.amount * currentBet.odds;
      await pool.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [winnings, req.user.id]
      );
    } else if (oldResult === 'pending' && newResult === 'lost') {
      // No balance change needed, amount was already deducted
    } else if (oldResult === 'won' && newResult === 'lost') {
      const winnings = currentBet.amount * currentBet.odds;
      await pool.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [winnings, req.user.id]
      );
    } else if (oldResult === 'lost' && newResult === 'won') {
      const winnings = currentBet.amount * currentBet.odds;
      await pool.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [winnings, req.user.id]
      );
    }

    res.json({ message: 'Bet updated successfully' });
  } catch (error) {
    console.error('Update bet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete bet
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the bet
    const bet = await pool.query(
      'SELECT * FROM bets WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (bet.rows.length === 0) {
      return res.status(404).json({ error: 'Bet not found' });
    }

    const currentBet = bet.rows[0];

    // If bet is pending, refund the amount
    if (currentBet.result === 'pending') {
      await pool.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [currentBet.amount, req.user.id]
      );
    }

    // Delete the bet
    await pool.query('DELETE FROM bets WHERE id = $1', [id]);

    res.json({ message: 'Bet deleted successfully' });
  } catch (error) {
    console.error('Delete bet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 