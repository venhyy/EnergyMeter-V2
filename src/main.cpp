#include <WiFi.h>
#include <FS.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <PZEM004Tv30.h>
#include <AsyncTCP.h>
#include <ArduinoJson.h>

const char* ssid = "ASUS";
const char* password = "asus1337";

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

// Create AsyncWebSocket object on port 81
AsyncWebSocket ws("/ws");


void sendMeasurementData() {
  if (ws.count() == 0) {
    return;
  }
  
  StaticJsonDocument<300> doc;
  JsonArray arr = doc.to<JsonArray>();
  
  for (int i = 0; i < 3; i++) {
    JsonObject obj = arr.createNestedObject();
    obj["voltage"] = random(220, 240);
    obj["current"] = random(5, 15) / 10.0;
    obj["power"] = random(2200, 24000) / 10.0;
    obj["frequency"] = random(49, 51) * 1.00;
    obj["pf"] = random(80, 100) / 100.0;
  }

  String jsonStr;
  serializeJson(doc, jsonStr);

  // Send the JSON string over the WebSocket connection
  ws.textAll(jsonStr);
}


// Define function to handle WebSocket events
void onWsEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.println("WebSocket client connected");
    client->ping();
  } else if (type == WS_EVT_DISCONNECT) {
    Serial.println("WebSocket client disconnected");
  } else if (type == WS_EVT_ERROR) {
    Serial.printf("WebSocket error(%s): %s\n", (const char*)arg, (char*)data);
  } else if (type == WS_EVT_DATA) {
    Serial.print("WebSocket data received: ");
    for (size_t i = 0; i < len; i++) {
      Serial.printf("%c", (char) data[i]);
    }
    Serial.println();
  }
}

void serveIndexHtml(AsyncWebServerRequest *request) {
  if (SPIFFS.exists("/index2.html")) {
    AsyncWebServerResponse *response = request->beginResponse(SPIFFS, "/index2.html", "text/html");
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

  ws.onEvent(onWsEvent);
  server.addHandler(&ws);
  server.begin();
}

void loop() {

  // Handle WebSocket events
  ws.cleanupClients();

  static unsigned long prevTime = 0;
  if (millis() - prevTime >= 5000) {
    sendMeasurementData();
    prevTime = millis();
  }
}