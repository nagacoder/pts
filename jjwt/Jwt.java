import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Base64;
import java.security.SecureRandom;
import java.util.Date;

public class Jwt {
    public static void main(String[] args) {
       // Generate a random 32-byte key
       byte[] keyBytes = new byte[32];
       new SecureRandom().nextBytes(keyBytes);
       String base64KeyString = Base64.getEncoder().encodeToString(keyBytes);
       
       // Print the generated base64-encoded key (for reference)
       System.out.println("Generated Base64 Key: " + base64KeyString);

       // Decode the base64 key and create the secret key
       byte[] decodedKey = Base64.getDecoder().decode(base64KeyString);
       Key secretKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, "HmacSHA256");
        Date afterAddingTenMins = new Date(System.currentTimeMillis() + 600000); // 10 minutes from now
        String audience = "exampleAudience";

        String token = Jwts.builder()
                .setExpiration(afterAddingTenMins)
                .setAudience(audience)
                .signWith(secretKey)
                .compact();

        System.out.println("Generated JWT: " + token);
    }
}
