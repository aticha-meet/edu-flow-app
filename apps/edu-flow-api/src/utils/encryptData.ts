/* eslint-disable @nx/enforce-module-boundaries */
import * as CryptoJS from 'crypto-js';

export const decryptedData = (originalData: any, secretKey: any, fieldsToEncrypt: string[]) => Object.fromEntries(
    Object.entries(originalData).map(([key, value]) => {
        if (fieldsToEncrypt.includes(key) && typeof value === 'string') {
            const decrypted = CryptoJS.AES.decrypt(value, secretKey).toString(CryptoJS.enc.Utf8);
            return [key, decrypted];
        }
        return [key, value];
    })
);