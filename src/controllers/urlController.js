import URL from "../models/URL.js";
import Analytics from "../models/Analytics.js";
import redisClient from "../config/redis.js";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();
// Shorten URL
export const createShortURL = async (req, res) => {
    console.log('shorten api hit')
    const { longUrl, customAlias, topic } = req.body;
    const userId = req.user.id;
  
    const alias = customAlias || nanoid(8);
    const shortUrl = `${process.env.REDIRECT_URL}/${alias}`;

  
    try {
      const newUrl = new URL({
        userId,
        longUrl,
        shortUrl,
        alias,
        topic,
      })
      await newUrl.save();
     console.log('newUrl:', newUrl);
  
      await redisClient.set(alias, longUrl);
  
      const cachedUrl = await redisClient.get(alias);
      console.log('cachedUrl:', cachedUrl);
  
      res.status(201).json({ shortUrl, createdAT: Date.now() });
    } catch (error) {
      res.status(500).json({ error: 'Error creating short URL' });
    }
  };

// Redirect Short URL
export const redirectShortURL = async (req, res) => {
  const { alias } = req.params;

  try {
    // Check Redis cache
    let longUrl = await redisClient.get(alias);

    if (!longUrl) {
      // If not in cache, fetch from database
      const urlData = await ShortURL.findOne({ alias });
      if (!urlData)
        return res.status(404).json({ error: "Short URL not found" });
      longUrl = urlData.longUrl;
      await redisClient.set(alias, longUrl); // Cache it
    }

    // Track analytics
    await Analytics.create({
      alias,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    res.redirect(longUrl);
  } catch (error) {
    res.status(500).json({ error: "Error redirecting to URL" });
  }
};
