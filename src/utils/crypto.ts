// src/utils/crypto.ts
import CryptoJS from "crypto-js";

// Obtenemos la llave secreta del archivo .env
const SECRET_KEY = import.meta.env.VITE_QR_SECRET || "fallback_secret_key";

export const encryptQR = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptQR = (cipherText: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    // Si la desencriptación falla o el texto está vacío, retornamos null
    if (!originalText) return null;
    return originalText;
  } catch (error) {
    // Si alguien pasa un QR falso que rompe el algoritmo, capturamos el error
    return null;
  }
};