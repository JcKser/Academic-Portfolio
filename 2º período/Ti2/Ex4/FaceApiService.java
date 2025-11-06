import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class FaceApiService {

    private static final String endpoint = "https://suzanell-exercicio4.cognitiveservices.azure.com/";  // Endpoint da Face API
    private static final String subscriptionKey = "eed80738fe124e4d93dcc591b13d2d13";  // Chave de assinatura da Face API

    public static void main(String[] args) {
        String imageUrl = "URL_DA_IMAGEM";  // URL da imagem que você quer analisar

        try {
            detectFaces(imageUrl);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void detectFaces(String imageUrl) throws Exception {
        URL url = new URL(endpoint + "/detect?returnFaceAttributes=age,gender,smile");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Ocp-Apim-Subscription-Key", subscriptionKey);
        connection.setDoOutput(true);

        String requestPayload = "{\"url\":\"" + imageUrl + "\"}";

        OutputStream outputStream = connection.getOutputStream();
        outputStream.write(requestPayload.getBytes());
        outputStream.flush();

        int responseCode = connection.getResponseCode();
        BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        if (responseCode == HttpURLConnection.HTTP_OK) {
            System.out.println("Response: " + response.toString());
        } else {
            System.out.println("Error: " + responseCode);
            System.out.println("Response: " + response.toString());
        }
    }
}
