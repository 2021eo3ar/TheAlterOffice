import Analytics from '../models/Analytics.js';

export const getURLAnalytics = async (req, res) => {
  const { alias } = req.params;

  try {
    const analytics = await Analytics.find({ alias });
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
};
