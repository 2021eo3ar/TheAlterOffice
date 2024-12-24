import { UAParser } from "ua-parser-js";

export const parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent);
  return {
    os: parser.getOS().name || 'Unknown',
    device: parser.getDevice().type || 'Unknown',
  };
};
