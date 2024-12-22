import Analytics from '../models/Analytics.js';
import URL from '../models/URL.js';

// Get URL Analytics
export const getURLAnalytics = async (req, res) => {
  const { alias } = req.params;

  try {
    const totalClicks = await Analytics.countDocuments({ alias });
    const uniqueClicks = await Analytics.distinct('ip', { alias });
    const clicksByDate = await Analytics.aggregate([
      { $match: { alias } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      totalClicks,
      uniqueClicks: uniqueClicks.length,
      clicksByDate,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
};

// Get Topic-Based Analytics
export const getTopicAnalytics = async (req, res) => {
  const { topic } = req.params;

  try {
    const urls = await URL.find({ topic });
    const totalClicks = await Analytics.countDocuments({ alias: { $in: urls.map(url => url.alias) } });
    const uniqueClicks = await Analytics.distinct('ip', { alias: { $in: urls.map(url => url.alias) } });

    const clicksByDate = await Analytics.aggregate([
      { $match: { alias: { $in: urls.map(url => url.alias) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      totalClicks,
      uniqueClicks: uniqueClicks.length,
      clicksByDate,
      urls: urls.map(url => ({ URL: `${process.env.BASE_URL}/${url.alias}`, totalClicks, uniqueClicks })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching topic-based analytics' });
  }
};

// Get Overall Analytics
export const getOverallAnalytics = async (req, res) => {
  try {
    const urls = await URL.find({ userId: req.user.id });
    const totalUrls = urls.length;
    const totalClicks = await Analytics.countDocuments({ alias: { $in: urls.map(url => url.alias) } });
    const uniqueClicks = await Analytics.distinct('ip', { alias: { $in: urls.map(url => url.alias) } });

    res.status(200).json({
      totalUrls,
      totalClicks,
      uniqueClicks: uniqueClicks.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching overall analytics' });
  }
};
