import { nanoid } from 'nanoid';

export const generateShortURL = (baseUrl, customAlias) => {
  const alias = customAlias || nanoid(8);
  return `${baseUrl}/${alias}`;
};
