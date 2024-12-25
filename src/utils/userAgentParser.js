import userAgent from 'user-agent';

export const detectOS = (userAgentString) => {
  const ua = userAgent.parse(userAgentString);
  
  // Check if ua.os.family exists, if not return a default value
  return ua.os && ua.os.family ? ua.os.family : 'Unknown OS';
};

export const detectDevice = (userAgentString) => {
  const ua = userAgent.parse(userAgentString);

  // Ensure ua.device is defined before accessing its properties
  if (ua.device && ua.device.family) {
    if (ua.device.family === 'Other') {
      return 'Desktop'; // Default to Desktop if 'Other' device is detected
    }
    return ua.device.family;  // Return the detected device type
  }

  // If device family is not detected, return 'Desktop' as a fallback
  return 'Desktop';
};
