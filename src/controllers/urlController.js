import { nanoid } from 'nanoid';
import redisClient from '../config/redis.js';
import URL from '../models/URL.js';

export const createShortURL = async (req, res) => {
  const { longUrl, customAlias, topic } = req.body;
  const userId = req.user.id;

  const alias = customAlias || nanoid(8);
  const shortUrl = `${process.env.BASE_URL}/${alias}`;

  try {
    const newUrl = await URL.create({
      userId,
      longUrl,
      shortUrl,
      alias,
      topic,
    });

    await redisClient.set(alias, longUrl);

    res.status(201).json({ shortUrl, createdAt: newUrl.createdAt });
  } catch (error) {
    res.status(500).json({ error: 'Error creating short URL' });
  }
};

export const redirectShortURL = async (req, res) => {
  const { alias } = req.params;

  try {
    const cachedUrl = await redisClient.get(alias);
    const url = cachedUrl || (await URL.findOne({ alias }));

    if (url) {
      res.redirect(url.longUrl);

      // Analytics logging logic (handled separately).
    } else {
      res.status(404).json({ error: 'URL not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error redirecting URL' });
  }
};
