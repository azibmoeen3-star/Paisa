const express = require('express');
const InvestmentPlanService = require('../services/investmentPlan.service');

const router = express.Router();

// Get all investment plans
router.get('/', async (req, res) => {
  try {
    const plans = await InvestmentPlanService.getAllPlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching investment plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investment plans'
    });
  }
});

// Create new plan (admin only)
router.post('/', async (req, res) => {
  try {
    const plan = await InvestmentPlanService.createPlan(req.body);
    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating plan'
    });
  }
});

// Update plan (admin only)
router.put('/:id', async (req, res) => {
  try {
    const plan = await InvestmentPlanService.updatePlan(req.params.id, req.body);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating plan'
    });
  }
});

// Delete plan (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const plan = await InvestmentPlanService.deletePlan(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting plan'
    });
  }
});

module.exports = router;