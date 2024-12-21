import crypto from 'crypto';

const generateShortURL = () => crypto.randomBytes(4).toString('hex');


export default generateShortURL;