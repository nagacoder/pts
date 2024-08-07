import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class AESGCMEncryption {

    private static final String ENCRYPTION_ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;  // GCM standard
    private static final String IV = "123456789123";  // must be 12 bytes for GCM
    private static final String AES_KEY = "1234567890123456";  // 16 characters (128 bits)

    public static void main(String[] args) throws Exception {
        String plainText = "Hello, World!";

        // Create SecretKeySpec from the hardcoded key
        SecretKeySpec key = new SecretKeySpec(AES_KEY.getBytes(), "AES");

        // Encrypt
        String cipherText = encrypt(plainText, key, IV.getBytes());
        System.out.println("Cipher Text: " + cipherText);

        // Decrypt
        String decryptedText = decrypt(cipherText, key, IV.getBytes());
        System.out.println("Decrypted Text: " + decryptedText);
    }

    public static String encrypt(String plainText, SecretKeySpec key, byte[] iv) throws Exception {
        Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, parameterSpec);

        byte[] cipherText = cipher.doFinal(plainText.getBytes());
        return Base64.getEncoder().encodeToString(cipherText);
    }

    public static String decrypt(String cipherText, SecretKeySpec key, byte[] iv) throws Exception {
        Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
        cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec);

        byte[] plainText = cipher.doFinal(Base64.getDecoder().decode(cipherText));
        return new String(plainText);
    }
}
