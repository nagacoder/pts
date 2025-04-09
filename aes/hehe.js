/**
 * JavaScript implementation of RSA password encryption
 * Converted from Java implementation
 */

class RIBLogin {
  constructor(serverPublicKey) {
    this.serverPublicKey = serverPublicKey;
    this.rsaObfuscation = new RSAObfuscation();
  }

  /**
   * Encrypts a password using the server's public key and random value
   * @param {string|char[]} password - The password to encrypt
   * @param {string} serverRandom - Random value from server
   * @returns {string} - Encrypted password
   */
  encryptPasswordChar(password, serverRandom) {
    try {
      // Handle both string and char array inputs
      const passwordArray = Array.isArray(password) ? password : Array.from(password);
      
      // Get the PKCS15 formatted block
      const pkcs15Block = this.buildPKCS15BlockForPassword(passwordArray, serverRandom);
      
      if (!pkcs15Block) {
        return null;
      }
      
      // Set the public key for RSA encryption
      const publicKeyParts = this.parsePublicKey();
      this.rsaObfuscation.setPublic(publicKeyParts.modulus, publicKeyParts.exponent);
      
      // Encrypt the block
      return this.rsaObfuscation.encryptNativeBytes(pkcs15Block);
    } catch (e) {
      console.error("Encryption error:", e);
      return null;
    }
  }

  /**
   * Builds a PKCS#15 formatted block for password encryption
   * @param {char[]} password - The password characters
   * @param {string} random - Random value from server
   * @returns {Uint8Array} - The formatted block
   */
  buildPKCS15BlockForPassword(password, random) {
    if (password.length > 30) {
      return null;
    }

    // Determine block size based on key length
    const keyLength = this.serverPublicKey.length;
    const blockSize = keyLength === 512 ? 256 : 128;
    const bytes = new Uint8Array(blockSize);

    // Convert password to bytes with UTF-8 encoding
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password.join(''));
    
    // Generate the 30-byte password portion with padding
    const formattedPasswordBytes = new Uint8Array(30);
    for (let i = 0; i < 30; i++) {
      if (i < passwordBytes.length) {
        formattedPasswordBytes[i] = passwordBytes[i];
      } else {
        formattedPasswordBytes[i] = 0xFF;
      }
    }

    // Convert the random hex string to bytes
    const randomBytes = this.fromHexString(random);

    // Calculate padding size
    const zeros = blockSize - randomBytes.length - formattedPasswordBytes.length;
    const bytesPad = this.randomBytes(zeros);

    // Ensure no zero bytes in padding except specific positions
    for (let i = 0; i < zeros; i++) {
      if (bytesPad[i] === 0x00) {
        bytesPad[i] = 0x28; // Replace zeros with 0x28
      }
    }

    // Set required PKCS#1 v1.5 header bytes
    bytesPad[0] = 0x00;
    bytesPad[1] = 0x02;
    bytesPad[10] = 0x00;

    // Combine all parts into final block
    let offset = 0;
    bytes.set(bytesPad, offset);
    offset += bytesPad.length;
    bytes.set(randomBytes, offset);
    offset += randomBytes.length;
    bytes.set(formattedPasswordBytes, offset);

    return bytes;
  }

  /**
   * Builds a PKCS#15 block for password change (old and new passwords)
   * @param {char[]} oldPassword - The old password
   * @param {char[]} newPassword - The new password
   * @param {string} random - Random value from server
   * @returns {Uint8Array} - The formatted block
   */
  buildPKCS15BlockForPinChangeChar(oldPassword, newPassword, random) {
    if (oldPassword.length > 30 || newPassword.length > 30) {
      return null;
    }

    // Determine block size based on key length
    const blockSize = this.serverPublicKey.length === 512 ? 256 : 128;
    const bytes = new Uint8Array(blockSize);

    // Convert passwords to bytes with UTF-8 encoding
    const encoder = new TextEncoder();
    
    // Process old password
    const oldPasswordBytes = encoder.encode(oldPassword.join(''));
    const formattedOldPasswordBytes = new Uint8Array(30);
    for (let i = 0; i < 30; i++) {
      formattedOldPasswordBytes[i] = i < oldPasswordBytes.length ? oldPasswordBytes[i] : 0xFF;
    }
    
    // Process new password
    const newPasswordBytes = encoder.encode(newPassword.join(''));
    const formattedNewPasswordBytes = new Uint8Array(30);
    for (let i = 0; i < 30; i++) {
      formattedNewPasswordBytes[i] = i < newPasswordBytes.length ? newPasswordBytes[i] : 0xFF;
    }

    // Convert random hex string to bytes
    const randomBytes = this.fromHexString(random);

    // Calculate padding size
    const zeros = blockSize - randomBytes.length - formattedNewPasswordBytes.length - formattedOldPasswordBytes.length;
    const bytesPad = this.randomBytes(zeros);

    // Ensure no zero bytes in padding except specific positions
    for (let i = 0; i < zeros; i++) {
      if (bytesPad[i] === 0x00) {
        bytesPad[i] = 0x28; // Replace zeros with 0x28
      }
    }

    // Set required PKCS#1 v1.5 header bytes
    bytesPad[0] = 0x00;
    bytesPad[1] = 0x02;
    bytesPad[10] = 0x00;

    // Combine all parts into final block
    let offset = 0;
    bytes.set(bytesPad, offset);
    offset += bytesPad.length;
    bytes.set(randomBytes, offset);
    offset += randomBytes.length;
    bytes.set(formattedNewPasswordBytes, offset);
    offset += formattedNewPasswordBytes.length;
    bytes.set(formattedOldPasswordBytes, offset);

    return bytes;
  }

  /**
   * Parse public key string into modulus and exponent
   * @returns {Object} Object containing modulus and exponent
   */
  parsePublicKey() {
    // This is a placeholder - the actual implementation would depend on the format of serverPublicKey
    // For example purposes, assuming serverPublicKey is in format "modulus:exponent"
    const parts = this.serverPublicKey.split(':');
    return {
      modulus: parts[0],
      exponent: parts.length > 1 ? parts[1] : '10001' // Default exponent is 65537 (0x10001)
    };
  }

  /**
   * Converts a hex string to a byte array
   * @param {string} s - Hex string
   * @returns {Uint8Array} - Byte array
   */
  fromHexString(s) {
    const len = s.length;
    const data = new Uint8Array(len / 2);
    for (let i = 0; i < len; i += 2) {
      data[i / 2] = (parseInt(s.charAt(i), 16) << 4) | parseInt(s.charAt(i + 1), 16);
    }
    return data;
  }

  /**
   * Generates an array of random bytes
   * @param {number} length - Number of bytes to generate
   * @returns {Uint8Array} - Array of random bytes
   */
  randomBytes(length) {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.ceil(Math.random() * 255);
    }
    return bytes;
  }
}

/**
 * JavaScript implementation of RSA encryption
 */
class RSAObfuscation {
  constructor() {
    this.n = null; // modulus
    this.e = null; // exponent
  }

  /**
   * Sets the public key components
   * @param {string} modulus - Modulus in hex format
   * @param {string} exponent - Exponent in hex format
   */
  setPublic(modulus, exponent) {
    if (modulus && exponent && modulus.length > 0 && exponent.length > 0) {
      this.n = BigInt('0x' + modulus);
      this.e = BigInt('0x' + exponent);
    }
  }

  /**
   * Encrypts a byte array using RSA
   * @param {Uint8Array} bytes - Bytes to encrypt
   * @returns {string} - Hex string of encrypted data
   */
  encryptNativeBytes(bytes) {
    try {
      // Validate input
      const maxLength = (this.n.toString(2).length + 7) >> 3;
      if (bytes.length > maxLength) {
        throw new Error("Invalid input length");
      }

      // Convert byte array to BigInt
      let value = this.bytesToBigInt(bytes);
      
      // Perform RSA encryption: c = m^e mod n
      let encryptedValue = this.doPublic(value);
      if (encryptedValue === null) {
        return null;
      }

      // Convert to hex string with proper padding
      let hexString = encryptedValue.toString(16);
      const expectedLength = maxLength * 2;
      
      if (hexString.length <= expectedLength) {
        // Pad with leading zeros if necessary
        hexString = hexString.padStart(expectedLength, '0');
        return hexString;
      }
      
      throw new Error("Cannot encode result");
    } catch (e) {
      console.error("RSA encryption error:", e);
      return null;
    }
  }

  /**
   * Performs RSA public key operation
   * @param {BigInt} value - Value to encrypt
   * @returns {BigInt} - Encrypted value
   */
  doPublic(value) {
    if (!this.n || !this.e) {
      return null;
    }
    
    // Perform modular exponentiation: value^e mod n
    return this.modPow(value, this.e, this.n);
  }

  /**
   * Modular exponentiation for BigInt
   * @param {BigInt} base - Base value
   * @param {BigInt} exponent - Exponent value
   * @param {BigInt} modulus - Modulus value
   * @returns {BigInt} - Result of base^exponent mod modulus
   */
  modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    
    let result = 1n;
    base = base % modulus;
    
    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = (result * base) % modulus;
      }
      exponent = exponent >> 1n;
      base = (base * base) % modulus;
    }
    
    return result;
  }

  /**
   * Converts a Uint8Array to a BigInt
   * @param {Uint8Array} bytes - Byte array
   * @returns {BigInt} - BigInt representation
   */
  bytesToBigInt(bytes) {
    let hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return BigInt('0x' + hex);
  }
}

/**
 * Example usage of the encryption
 */
function generateEncryptedPassword(password, serverPublicKey, serverRandom) {
  const ribLoginUtils = new RIBLogin(serverPublicKey);
  let encryptedPassword = null;
  
  try {
    // Convert string password to char array if needed
    const passwordChars = Array.isArray(password) ? password : Array.from(password);
    encryptedPassword = ribLoginUtils.encryptPasswordChar(passwordChars, serverRandom);
  } catch (e) {
    console.error("Encryption error:", e);
  }
  
  return encryptedPassword;
}

// Example implementation for password change
function generateEncryptedPasswordChange(oldPassword, newPassword, serverPublicKey, serverRandom) {
  const ribLoginUtils = new RIBLogin(serverPublicKey);
  let encryptedData = null;
  
  try {
    // Build the PKCS15 block with both passwords
    const oldPasswordChars = Array.isArray(oldPassword) ? oldPassword : Array.from(oldPassword);
    const newPasswordChars = Array.isArray(newPassword) ? newPassword : Array.from(newPassword);
    
    const block = ribLoginUtils.buildPKCS15BlockForPinChangeChar(oldPasswordChars, newPasswordChars, serverRandom);
    
    if (block) {
      // Set the public key for RSA encryption
      const publicKeyParts = ribLoginUtils.parsePublicKey();
      ribLoginUtils.rsaObfuscation.setPublic(publicKeyParts.modulus, publicKeyParts.exponent);
      
      // Encrypt the block
      encryptedData = ribLoginUtils.rsaObfuscation.encryptNativeBytes(block);
    }
  } catch (e) {
    console.error("Password change encryption error:", e);
  }
  
  return encryptedData;
}
