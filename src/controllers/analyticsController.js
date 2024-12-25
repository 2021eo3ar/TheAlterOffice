import URL from "../models/URL.js";
import redisClient from "../config/redis.js";

export const getURLAnalytics = async (req, res) => {
  const { alias } = req.params;

  try {
    // Fetch data from the database
    const url = await URL.findOne({ alias });
    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Get total and unique clicks
    const totalClicks = url.totalClicks;
    const uniqueClicks = url.uniqueClicks;

    // Get the last 7 days of clicks
    const clicksByDate = url.clicksByDate.slice(-7);

    // OS Type and Device Type stats calculation
    const osTypeStats = url.osType.map(os => ({
      osName: os.osName,
      uniqueClicks: os.uniqueClicks,
      uniqueUsers: os.uniqueUsers,
    }));

    const deviceTypeStats = url.deviceType.map(device => ({
      deviceName: device.deviceName,
      uniqueClicks: device.uniqueClicks,
      uniqueUsers: device.uniqueUsers,
    }));

    // Send the response
    res.status(200).json({
      totalClicks,
      uniqueClicks,
      clicksByDate,
      osType: osTypeStats,
      deviceType: deviceTypeStats,
    });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving URL analytics" });
  }
};

// Get Topic-Based Analytics for a specific topic
export const getTopicAnalytics = async (req, res) => {
  const { topic } = req.params;

  try {
    const urls = await URL.find({ topic });
    if (!urls.length) {
      return res.status(404).json({ error: "No URLs found for this topic" });
    }

    let totalClicks = 0;
    let uniqueClicks = 0;
    let clicksByDate = [];
    const urlStats = [];

    urls.forEach(url => {
      totalClicks += url.totalClicks;
      uniqueClicks += url.uniqueClicks;

      urlStats.push({
        shortUrl: url.shortUrl,
        totalClicks: url.totalClicks,
        uniqueClicks: url.uniqueClicks,
      });

      // Aggregate clicks by date for all URLs in the topic
      url.clicksByDate.forEach(entry => {
        const existingEntry = clicksByDate.find(dateEntry => dateEntry.date === entry.date);
        if (existingEntry) {
          existingEntry.clicks += entry.clicks;
        } else {
          clicksByDate.push({ date: entry.date, clicks: entry.clicks });
        }
      });
    });

    // Sort by date (most recent first)
    clicksByDate.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      totalClicks,
      uniqueClicks,
      clicksByDate,
      urls: urlStats,
    });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving topic analytics" });
  }
};

// Get Overall Analytics for all URLs created by the authenticated user
export const getOverallAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const urls = await URL.find({ userId });
    if (!urls.length) {
      return res.status(404).json({ error: "No URLs found for this user" });
    }

    let totalUrls = urls.length;
    let totalClicks = 0;
    let uniqueClicks = 0;
    let clicksByDate = [];
    let osTypeStats = [];
    let deviceTypeStats = [];

    urls.forEach(url => {
      totalClicks += url.totalClicks;
      uniqueClicks += url.uniqueClicks;

      // Aggregate clicks by date for all URLs created by the user
      url.clicksByDate.forEach(entry => {
        const existingEntry = clicksByDate.find(dateEntry => dateEntry.date === entry.date);
        if (existingEntry) {
          existingEntry.clicks += entry.clicks;
        } else {
          clicksByDate.push({ date: entry.date, clicks: entry.clicks });
        }
      });

      // OS type and device type stats calculation
      url.osType.forEach(os => {
        const osStat = osTypeStats.find(item => item.osName === os.osName);
        if (osStat) {
          osStat.uniqueClicks += os.uniqueClicks;
          osStat.uniqueUsers += os.uniqueUsers;
        } else {
          osTypeStats.push({ osName: os.osName, uniqueClicks: os.uniqueClicks, uniqueUsers: os.uniqueUsers });
        }
      });

      url.deviceType.forEach(device => {
        const deviceStat = deviceTypeStats.find(item => item.deviceName === device.deviceName);
        if (deviceStat) {
          deviceStat.uniqueClicks += device.uniqueClicks;
          deviceStat.uniqueUsers += device.uniqueUsers;
        } else {
          deviceTypeStats.push({ deviceName: device.deviceName, uniqueClicks: device.uniqueClicks, uniqueUsers: device.uniqueUsers });
        }
      });
    });

    // Sort clicksByDate by most recent
    clicksByDate.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      totalUrls,
      totalClicks,
      uniqueClicks,
      clicksByDate,
      osType: osTypeStats,
      deviceType: deviceTypeStats,
    });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving overall analytics" });
  }
};


