
import { URL } from '../models/url.js';
import generateShortURL from '../utils/generareShortUrl.js';

const createShortURL = async (req, res, next) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    const shortUrl = customAlias || generateShortURL();

    const url = new URL({ longUrl, shortUrl, topic, createdBy: req.user.id });
    await url.save();

    res.status(201).json({ shortUrl: `${process.env.BASE_URL}/${shortUrl}`, createdAt: url.createdAt });
  } catch (err) {
    next(err);
  }
};


export default createShortURL
