#include <WiFi.h>
#include <FS.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>

const char* ssid = "ASUS";
const char* password = "asus1337";

AsyncWebServer server(80);

void serveIndexHtml(AsyncWebServerRequest *request) {
  if (SPIFFS.exists("/index.html")) {
    AsyncWebServerResponse *response = request->beginResponse(SPIFFS, "/index.html", "text/html");
    request->send(response);
  } else {
    request->send(404);
  }
}

void setup() {
  Serial.begin(9600);
  SPIFFS.begin();

  // Connect to Wi-Fi network
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.println(WiFi.localIP());

  // Serve index.html file
  server.on("/", HTTP_GET, serveIndexHtml);

  server.begin();
}

void loop() {
}