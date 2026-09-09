const isProduction = process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true';

const apiUrl =
    process.env.NEXT_PUBLIC_ENDPOINT_URL ||
    (isProduction
        ? process.env.NEXT_PUBLIC_PROD_ENDPOINT_URL
        : process.env.NEXT_PUBLIC_LOCAL_ENDPOINT_URL);

const authUrl =
    process.env.NEXT_PUBLIC_AUTH_URL ||
    (isProduction
        ? process.env.NEXT_PUBLIC_PROD_AUTH_URL
        : process.env.NEXT_PUBLIC_LOCAL_AUTH_URL);

export const PAGE_PATH = {
    NEXTAUTH_URL: authUrl as string,
    API_URL: apiUrl as string,
};

