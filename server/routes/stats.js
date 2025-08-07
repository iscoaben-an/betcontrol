const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { body } = require('express-validator'); // Added for validation
const { validationResult } = require('express-validator'); // Added for validation

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get comprehensive statistics in a single query
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_bets,
        COUNT(CASE WHEN result = 'won' THEN 1 END) as won_bets,
        COUNT(CASE WHEN result = 'lost' THEN 1 END) as lost_bets,
        COUNT(CASE WHEN result = 'pending' THEN 1 END) as pending_bets,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN result = 'won' THEN amount * odds ELSE 0 END), 0) as total_winnings,
        COALESCE(SUM(CASE WHEN result = 'won' THEN amount * odds - amount ELSE 0 END), 0) as net_profit,
        COALESCE(AVG(odds), 0) as avg_odds,
        CASE 
          WHEN COUNT(CASE WHEN result IN ('won', 'lost') THEN 1 END) > 0 THEN 
            ROUND((COUNT(CASE WHEN result = 'won' THEN 1 END)::float / COUNT(CASE WHEN result IN ('won', 'lost') THEN 1 END) * 100)::numeric, 2)
          ELSE 0 
        END as win_rate,
        CASE 
          WHEN COALESCE(SUM(amount), 0) > 0 THEN 
            ROUND((COALESCE(SUM(CASE WHEN result = 'won' THEN amount * odds - amount ELSE 0 END), 0)::float / COALESCE(SUM(amount), 1) * 100)::numeric, 2)
          ELSE 0 
        END as roi
      FROM bets 
      WHERE user_id = $1
    `, [req.user.id]);

    // Get user info including initial balance
    const user = await pool.query(
      'SELECT balance, initial_balance FROM users WHERE id = $1',
      [req.user.id]
    );

    const result = stats.rows[0];
    const userData = user.rows.length > 0 ? user.rows[0] : { balance: 0, initial_balance: 1000 };
    
    // Calculate balances
    const initialBalance = parseFloat(userData.initial_balance || 1000);
    const currentBalance = parseFloat(userData.balance || 1000);
    const totalWinnings = parseFloat(result.total_winnings || 0);
    const totalAmount = parseFloat(result.total_amount || 0);
    
    // Available balance = Current balance + Total winnings (money that can be reused)
    const availableBalance = currentBalance + totalWinnings;

    const dashboardStats = {
      totalBets: parseInt(result.total_bets),
      wonBets: parseInt(result.won_bets),
      lostBets: parseInt(result.lost_bets),
      pendingBets: parseInt(result.pending_bets),
      totalAmount: totalAmount,
      totalWinnings: totalWinnings,
      netProfit: parseFloat(result.net_profit),
      avgOdds: parseFloat(result.avg_odds),
      winRate: parseFloat(result.win_rate),
      roi: parseFloat(result.roi),
      initialBalance: initialBalance,
      currentBalance: currentBalance,
      availableBalance: availableBalance
    };

    res.json({ stats: dashboardStats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get statistics by sport
router.get('/by-sport', auth, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        sport,
        COUNT(*) as total_bets,
        COUNT(CASE WHEN result = 'won' THEN 1 END) as won_bets,
        COUNT(CASE WHEN result = 'lost' THEN 1 END) as lost_bets,
        COUNT(CASE WHEN result = 'pending' THEN 1 END) as pending_bets,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN result = 'won' THEN amount * odds ELSE 0 END), 0) as total_winnings,
        COALESCE(SUM(CASE WHEN result = 'won' THEN amount * odds - amount ELSE 0 END), 0) as net_profit,
        COALESCE(AVG(odds), 0) as avg_odds,
        CASE 
          WHEN COUNT(CASE WHEN result IN ('won', 'lost') THEN 1 END) > 0 THEN 
            ROUND((COUNT(CASE WHEN result = 'won' THEN 1 END)::float / COUNT(CASE WHEN result IN ('won', 'lost') THEN 1 END) * 100)::numeric, 2)
          ELSE 0 
        END as win_rate,
        CASE 
          WHEN COALESCE(SUM(amount), 0) > 0 THEN 
            ROUND((COALESCE(SUM(CASE WHEN result = 'won' THEN amount * odds - amount ELSE 0 END), 0)::float / COALESCE(SUM(amount), 1) * 100)::numeric, 2)
          ELSE 0 
        END as roi
      FROM bets 
      WHERE user_id = $1 
      GROUP BY sport 
      ORDER BY total_bets DESC
    `, [req.user.id]);

    res.json({ stats: stats.rows });
  } catch (error) {
    console.error('Sport stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get statistics by category
router.get('/by-category', auth, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        category,
        COUNT(*) as total_bets,
        COUNT(CASE WHEN result = 'won' THEN 1 END) as won_bets,
        COUNT(CASE WHEN result = 'lost' THEN 1 END) as lost_bets,
        COUNT(CASE WHEN result = 'pending' THEN 1 END) as pending_bets,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN result = 'won' THEN amount * odds ELSE 0 END), 0) as total_winnings,
        COALESCE(SUM(CASE WHEN result = 'won' THEN amount * odds - amount ELSE 0 END), 0) as net_profit,
        COALESCE(AVG(odds), 0) as avg_odds,
        CASE 
          WHEN COUNT(CASE WHEN result IN ('won', 'lost') THEN 1 END) > 0 THEN 
            ROUND((COUNT(CASE WHEN result = 'won' THEN 1 END)::float / COUNT(CASE WHEN result IN ('won', 'lost') THEN 1 END) * 100)::numeric, 2)
          ELSE 0 
        END as win_rate,
        CASE 
          WHEN COALESCE(SUM(amount), 0) > 0 THEN 
            ROUND((COALESCE(SUM(CASE WHEN result = 'won' THEN amount * odds - amount ELSE 0 END), 0)::float / COALESCE(SUM(amount), 1) * 100)::numeric, 2)
          ELSE 0 
        END as roi
      FROM bets 
      WHERE user_id = $1 
      GROUP BY category 
      ORDER BY total_bets DESC
    `, [req.user.id]);

    res.json({ stats: stats.rows });
  } catch (error) {
    console.error('Category stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recent bets for dashboard
router.get('/recent', auth, async (req, res) => {
  try {
    const recentBets = await pool.query(
      'SELECT * FROM bets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );

    res.json({ recentBets: recentBets.rows });
  } catch (error) {
    console.error('Recent bets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user balance (add/withdraw funds)
router.post('/balance', [
  auth,
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('operation').isIn(['add', 'withdraw']).withMessage('Operation must be add or withdraw')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, operation } = req.body;
    const userId = req.user.id;

    // Get current balance
    const user = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentBalance = parseFloat(user.rows[0].balance);
    let newBalance;
    let movementType;
    let description;

    if (operation === 'add') {
      newBalance = currentBalance + parseFloat(amount);
      movementType = 'deposit';
      description = `Depósito de $${amount}`;
    } else {
      if (currentBalance < parseFloat(amount)) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }
      newBalance = currentBalance - parseFloat(amount);
      movementType = 'withdrawal';
      description = `Retiro de $${amount}`;
    }

    // Update user balance
    await pool.query(
      'UPDATE users SET balance = $1 WHERE id = $2',
      [newBalance, userId]
    );

    // Record the movement
    await pool.query(
      'INSERT INTO balance_movements (user_id, type, amount, previous_balance, new_balance, description) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, movementType, amount, currentBalance, newBalance, description]
    );

    res.json({ 
      message: `${operation === 'add' ? 'Funds added' : 'Funds withdrawn'} successfully`,
      newBalance: newBalance
    });
  } catch (error) {
    console.error('Balance update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get balance movement history
router.get('/balance/history', auth, async (req, res) => {
  try {
    const movements = await pool.query(`
      SELECT 
        id,
        type,
        amount,
        previous_balance,
        new_balance,
        description,
        created_at
      FROM balance_movements 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [req.user.id]);

    res.json({ movements: movements.rows });
  } catch (error) {
    console.error('Balance history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 