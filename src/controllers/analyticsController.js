import Analytics from '../models/Analytics.js';
import { parseUserAgent } from '../utils/userAgentParser.js';

// Helper to parse and count OS and Device Analytics
const getOSAndDeviceTypeAnalytics = async (filter) => {
  try {
    const analyticsData = await Analytics.find(filter);
    const osTypeCounts = {};
    const deviceTypeCounts = {};
    const uniqueUsersByOS = {};
    const uniqueUsersByDevice = {};

    analyticsData.forEach((entry) => {
      const { os, device } = parseUserAgent(entry.userAgent);
      osTypeCounts[os] = (osTypeCounts[os] || 0) + 1;
      deviceTypeCounts[device] = (deviceTypeCounts[device] || 0) + 1;

      uniqueUsersByOS[os] = uniqueUsersByOS[os] || new Set();
      uniqueUsersByOS[os].add(entry.ip);

      uniqueUsersByDevice[device] = uniqueUsersByDevice[device] || new Set();
      uniqueUsersByDevice[device].add(entry.ip);
    });

    return {
      osTypeAnalytics: Object.keys(osTypeCounts).map((os) => ({
        osName: os,
        uniqueClicks: osTypeCounts[os],
        uniqueUsers: uniqueUsersByOS[os].size,
      })),
      deviceTypeAnalytics: Object.keys(deviceTypeCounts).map((device) => ({
        deviceName: device,
        uniqueClicks: deviceTypeCounts[device],
        uniqueUsers: uniqueUsersByDevice[device].size,
      })),
    };
  } catch (error) {
    console.error('Error in getOSAndDeviceTypeAnalytics:', error);
    throw new Error('Failed to fetch OS and Device Type Analytics');
  }
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
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const { osTypeAnalytics, deviceTypeAnalytics } = await getOSAndDeviceTypeAnalytics(filter);

    res.status(200).json({
      totalClicks,
      uniqueClicks: uniqueClicks.length,
      clicksByDate,
      osTypeAnalytics,
      deviceTypeAnalytics,
    });
  } catch (error) {
    console.error('Error in getURLAnalytics:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
};

// Get Topic Analytics
export const getTopicAnalytics = async (req, res) => {
  const { topic } = req.params;
  const filter = { topic };

  try {
    const totalClicks = await Analytics.countDocuments(filter);
    const uniqueClicks = await Analytics.distinct('ip', filter);

    const clicksByTopic = await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 },
        },
      },
    ]);

    const { osTypeAnalytics, deviceTypeAnalytics } = await getOSAndDeviceTypeAnalytics(filter);

    res.status(200).json({
      totalClicks,
      uniqueClicks: uniqueClicks.length,
      clicksByTopic,
      osTypeAnalytics,
      deviceTypeAnalytics,
    });
  } catch (error) {
    console.error('Error in getTopicAnalytics:', error);
    res.status(500).json({ error: 'Error fetching topic analytics' });
  }
};

// Get Overall Analytics
export const getOverallAnalytics = async (req, res) => {
  const filter = {}; // No specific filter for overall analytics

  try {
    const totalClicks = await Analytics.countDocuments(filter);
    const uniqueClicks = await Analytics.distinct('ip', filter);

    const clicksByDate = await Analytics.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const { osTypeAnalytics, deviceTypeAnalytics } = await getOSAndDeviceTypeAnalytics(filter);

    res.status(200).json({
      totalClicks,
      uniqueClicks: uniqueClicks.length,
      clicksByDate,
      osTypeAnalytics,
      deviceTypeAnalytics,
    });
  } catch (error) {
    console.error('Error in getOverallAnalytics:', error);
    res.status(500).json({ error: 'Error fetching overall analytics' });
  }
};

// Add parsing functionality during data insertion
export const addAnalyticsEntry = async (req, res) => {
  const { alias, ip, timestamp, userAgent, topic } = req.body;

  try {
    const { os, device } = parseUserAgent(userAgent);

    const newEntry = new Analytics({
      alias,
      ip,
      timestamp,
      userAgent,
      osType: os,
      deviceType: device,
      topic,
    });

    await newEntry.save();
    res.status(201).json({ message: 'Analytics entry added successfully' });
  } catch (error) {
    console.error('Error in addAnalyticsEntry:', error);
    res.status(500).json({ error: 'Failed to add analytics entry' });
  }
};