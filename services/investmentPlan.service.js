const InvestmentPlan = require('../models/investmentPlan.model');

class InvestmentPlanService {
  static async createPlan(planData) {
    try {
      const plan = new InvestmentPlan(planData);
      return await plan.save();
    } catch (error) {
      throw error;
    }
  }

  static async getAllPlans() {
    try {
      return await InvestmentPlan.find({ isActive: true }).sort({ invest: 1 });
    } catch (error) {
      throw error;
    }
  }

  static async getPlanById(id) {
    try {
      return await InvestmentPlan.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async updatePlan(id, updateData) {
    try {
      return await InvestmentPlan.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw error;
    }
  }

  static async deletePlan(id) {
    try {
      return await InvestmentPlan.findByIdAndUpdate(id, { isActive: false }, { new: true });
    } catch (error) {
      throw error;
    }
  }

  static async seedPlans() {
    try {
      const existingPlans = await InvestmentPlan.countDocuments();
      if (existingPlans > 0) {
        return { message: 'Plans already exist' };
      }

      const plans = [
        { invest: 360, daily: 30 },
        { invest: 1000, daily: 120 },
        { invest: 2000, daily: 280 },
        { invest: 5000, daily: 600 },
        { invest: 10000, daily: 1500 },
        { invest: 15000, daily: 2500 },
        { invest: 25000, daily: 4300 },
        { invest: 50000, daily: 10000 },
        { invest: 75000, daily: 16000 },
        { invest: 100000, daily: 23000 }
      ];

      await InvestmentPlan.insertMany(plans);
      return { message: 'Plans seeded successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = InvestmentPlanService;
