import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Dump {
    private static final String LOG_FILE = "api_log.txt";

    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("Please provide the URL and number of iterations as arguments.");
            return;
        }

        String apiUrl = args[0];
        int numIterations = Integer.parseInt(args[1]);

        // Create a thread pool with multiple threads
        ExecutorService executor = Executors.newFixedThreadPool(10);
      for(int i  = 0 ; i< numIterations ; i++){
        // Submit tasks to the thread pool to make API calls in parallel
            for (int j = 0; j < 10; j++) {
                final int taskId = i; // effectively final variable
                executor.submit(new ApiCaller(apiUrl, i+taskId));
            }
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt(); // Preserve interrupted status
                e.printStackTrace();
            }
        }

        // Shutdown the executor after all tasks are completed
        executor.shutdown();
    }

    public static void writeLog(String fileName, String content) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName, true))) {
            writer.write(content);
            writer.newLine();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    static class ApiResponse {
        private final int responseCode;
        private final String responseBody;

        public ApiResponse(int responseCode, String responseBody) {
            this.responseCode = responseCode;
            this.responseBody = responseBody;
        }

        public int getResponseCode() {
            return responseCode;
        }

        public String getResponseBody() {
            return responseBody;
        }
    }


    static class ApiCaller implements Runnable {
        private final String apiUrl;
        private final int taskId;

        public ApiCaller(String apiUrl, int taskId) {
            this.apiUrl = apiUrl;
            this.taskId = taskId;
        }

        @Override
        public void run() {
            long startTime = System.currentTimeMillis();
            ApiResponse response = callApi(apiUrl, taskId);
            long endTime = System.currentTimeMillis();
            long durationMillis = endTime - startTime;
            double durationSeconds = durationMillis / 1000.0;
            writeLog(LOG_FILE, "Task_" + taskId + ": API Call Duration - " + durationSeconds + " seconds, Response Code - " + response.getResponseCode() + ", Response Body - " + response.getResponseBody());
        }

        private ApiResponse callApi(String apiUrl, int taskId) {
            try {
                // Create URL object with the API endpoint
                URL url = new URL(apiUrl);

                // Open a connection to the URL
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();

                // Set request method
                connection.setRequestMethod("GET");
                int responseCode = connection.getResponseCode();
                StringBuilder response = new StringBuilder();
                    try (BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                        String inputLine;
                        while ((inputLine = in.readLine()) != null) {
                            response.append(inputLine);
                        }
                    }

                // Close connection
                connection.disconnect();
                return new ApiResponse(responseCode, response.toString());
            } catch (Exception e) {
                e.printStackTrace();
                return new ApiResponse(-1, null);
            }
        }
    }
}
