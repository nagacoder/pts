import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
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
        ExecutorService executor = Executors.newFixedThreadPool(numIterations);

        // Submit tasks to the thread pool to make API calls in parallel
        for (int i = 0; i < numIterations; i++) {
            executor.submit(new ApiCaller(apiUrl,i));
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

    static class ApiCaller implements Runnable {
        private final int taskId;
        private final String apiUrl;

        public ApiCaller(String apiUrl, int taskId) {
            this.apiUrl = apiUrl;
            this.taskId = taskId;
        }

        @Override
        public void run() {
            callApi(apiUrl, taskId);
        }

        private void callApi(String apiUrl,int taskId) {
            try {
                // Create URL object with the API endpoint
                URL url = new URL(apiUrl);

                // Open a connection to the URL
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();

                // Set request method
                connection.setRequestMethod("GET");
                int responseCode = connection.getResponseCode();

                // Write the log entry to the log file
                String logEntry = LocalDateTime.now() + " - Task_" + taskId + ": Response Code - " + responseCode;
                writeLog(LOG_FILE, logEntry);

                // Close connection
                connection.disconnect();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
