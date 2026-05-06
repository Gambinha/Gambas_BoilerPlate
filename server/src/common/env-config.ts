import * as dotenv from 'dotenv';
dotenv.config();

export const ENV_CONFIG = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || '',
};
