const env = process.env;
const isProduction = env.IS_PRODUCTION === 'true';

export const PATH_ENV = {
  PORT: env.PORT || 3333,
  FRONT_URL: isProduction ? env.PROD_FRONTEND_URL : env.LOCAL_FRONTEND_URL,
  API_URL: isProduction
    ? env.PROD_ENDPOINT_URL
    : process.env.LOCAL_ENDPOINT_URL,
};
