// analyticsController.js

import Analytics from '../models/Analytics.js';
import URL from '../models/URL.js';

// Helper to get OS and Device Type Analytics
const getOSAndDeviceTypeAnalytics = async (filter) => {
  const osAnalytics = await Analytics.aggregate([
    { $match: filter },
    { $group: { _id: '$os', uniqueClicks: { $addToSet: '$ip' }, uniqueUsers: { $addToSet: '$userId' } } },
    { $project: { osName: '$_id', uniqueClicks: { $size: '$uniqueClicks' }, uniqueUsers: { $size: '$uniqueUsers' }, _id: 0 } },
  ]);

  const deviceAnalytics = await Analytics.aggregate([
    { $match: filter },
    { $group: { _id: '$device', uniqueClicks: { $addToSet: '$ip' }, uniqueUsers: { $addToSet: '$userId' } } },
    { $project: { deviceName: '$_id', uniqueClicks: { $size: '$uniqueClicks' }, uniqueUsers: { $size: '$uniqueUsers' }, _id: 0 } },
  ]);

  return { osAnalytics, deviceAnalytics };
};

// Get URL Analytics
export const getURLAnalytics = async (req, res) => {
  const { alias } = req.params;
  const recentDays = 7;
  const filter = { alias, timestamp: { $gte: new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000) } };

  try {
    const totalClicks = await Analytics.countDocuments(filter);
    const uniqueClicks = await Analytics.distinct('ip', filter);

    const clicksByDate = await Analytics.aggregate([
      { $match: filter },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
    ]);

    const { osAnalytics, deviceAnalytics } = await getOSAndDeviceTypeAnalytics(filter);

    res.status(200).json({
      totalClicks,
      uniqueClicks: uniqueClicks.length,
      clicksByDate,
      osType: osAnalytics,
      deviceType: deviceAnalytics,
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
    const aliases = urls.map(url => url.alias);

    const totalClicks = await Analytics.countDocuments({ alias: { $in: aliases } });
    const uniqueClicks = await Analytics.distinct('ip', { alias: { $in: aliases } });

    const clicksByDate = await Analytics.aggregate([
      { $match: { alias: { $in: aliases } } },
      { $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, 
          count: { $sum: 1 } 
        } 
      },
    ]);

    const osType = await Analytics.aggregate([
      { $match: { alias: { $in: aliases } } },
      { $group: { 
          _id: "$osName", 
          uniqueClicks: { $sum: 1 }, 
          uniqueUsers: { $addToSet: "$ip" } 
        } 
      },
      { $project: { 
          osName: "$_id", 
          uniqueClicks: "$uniqueClicks", 
          uniqueUsers: { $size: "$uniqueUsers" } 
        } 
      },
    ]);

    const deviceType = await Analytics.aggregate([
      { $match: { alias: { $in: aliases } } },
      { $group: { 
          _id: "$deviceName", 
          uniqueClicks: { $sum: 1 }, 
          uniqueUsers: { $addToSet: "$ip" } 
        } 
      },
      { $project: { 
          deviceName: "$_id", 
          uniqueClicks: "$uniqueClicks", 
          uniqueUsers: { $size: "$uniqueUsers" } 
        } 
      },
    ]);

    const urlsAnalytics = await Promise.all(
      urls.map(async url => {
        const shortUrl = `${process.env.BASE_URL}/${url.alias}`;
        const totalClicks = await Analytics.countDocuments({ alias: url.alias });
        const uniqueClicks = await Analytics.distinct('ip', { alias: url.alias });

        return {
          shortUrl,
          totalClicks,
          uniqueClicks: uniqueClicks.length,
        };
      })
    );

    res.status(200).json({
      totalClicks,
      uniqueClicks: uniqueClicks.length,
      clicksByDate,
      osType,
      deviceType,
      urls: urlsAnalytics,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching topic-based analytics' });
  }
};

// Get Overall Analytics
export const getOverallAnalytics = async (req, res) => {
  try {
    const urls = await URL.find({ userId: req.user.id });
    const aliases = urls.map(url => url.alias);

    const totalUrls = urls.length;
    const totalClicks = await Analytics.countDocuments({ alias: { $in: aliases } });
    const uniqueClicks = await Analytics.distinct('ip', { alias: { $in: aliases } });

    const clicksByDate = await Analytics.aggregate([
      { $match: { alias: { $in: aliases } } },
      { $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, 
          count: { $sum: 1 } 
        } 
      },
    ]);

    const osType = await Analytics.aggregate([
      { $match: { alias: { $in: aliases } } },
      { $group: { 
          _id: "$osName", 
          uniqueClicks: { $sum: 1 }, 
          uniqueUsers: { $addToSet: "$ip" } 
        } 
      },
      { $project: { 
          osName: "$_id", 
          uniqueClicks: "$uniqueClicks", 
          uniqueUsers: { $size: "$uniqueUsers" } 
        } 
      },
    ]);

    const deviceType = await Analytics.aggregate([
      { $match: { alias: { $in: aliases } } },
      { $group: { 
          _id: "$deviceName", 
          uniqueClicks: { $sum: 1 }, 
          uniqueUsers: { $addToSet: "$ip" } 
        } 
      },
      { $project: { 
          deviceName: "$_id", 
          uniqueClicks: "$uniqueClicks", 
          uniqueUsers: { $size: "$uniqueUsers" } 
        } 
      },
    ]);

    res.status(200).json({
      totalUrls,
      totalClicks,
      uniqueClicks: uniqueClicks.length,
      clicksByDate,
      osType,
      deviceType,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching overall analytics' });
  }
};

