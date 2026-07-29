const isProduction = process.env.NEXT_PUBLIC_IS_PRODUCTION === "true";

export const PAGE_PATH = {
    NEXTAUTH_URL: isProduction
        ? process.env.NEXT_PUBLIC_PROD_AUTH_URL as string
        : process.env.NEXT_PUBLIC_LOCAL_AUTH_URL as string,
    API_URL: isProduction
        ? process.env.NEXT_PUBLIC_PROD_ENDPOINT_URL
        : process.env.NEXT_PUBLIC_LOCAL_ENDPOINT_URL,
}

