#include <WiFi.h>
#include <FS.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <PZEM004Tv30.h>
#include <AsyncTCP.h>
#include <ArduinoJson.h>
#include <ESPmDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <HardwareSerial.h>

const char *ssid = "ASUS";
const char *password = "asus1337";

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

// Create AsyncWebSocket object on port 81
AsyncWebSocket ws("/ws");

#define MAX_PZEM 3
#define PZEM_DEFAULT_TIMEOUT 1000
unsigned long lastMeasurementTime[MAX_PZEM];

#define CONSOLE_SERIAL Serial

HardwareSerial ESP32Serial1(0);
HardwareSerial ESP32Serial2(1);
HardwareSerial ESP32Serial3(2);

PZEM004Tv30 pzem[MAX_PZEM] = {
    PZEM004Tv30(ESP32Serial1, 3, 1, 0x01),
    PZEM004Tv30(ESP32Serial2, 4, 2, 0x02),
    PZEM004Tv30(ESP32Serial3, 16, 17, 0x03),
};

// Define function to handle WebSocket events
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len)
{
  if (type == WS_EVT_CONNECT)
  {
    Serial.println("WebSocket client connected");
    client->ping();
  }
  else if (type == WS_EVT_DISCONNECT)
  {
    Serial.println("WebSocket client disconnected");
  }
  else if (type == WS_EVT_ERROR)
  {
    Serial.printf("WebSocket error(%s): %s\n", (const char *)arg, (char *)data);
  }
  else if (type == WS_EVT_DATA)
  {
    Serial.print("WebSocket data received: ");
    for (size_t i = 0; i < len; i++)
    {
      Serial.printf("%c", (char)data[i]);
    }
    Serial.println();
  }
}

void serveIndexHtml(AsyncWebServerRequest *request)
{
  if (SPIFFS.exists("/index3.html"))
  {
    AsyncWebServerResponse *response = request->beginResponse(SPIFFS, "/index3.html", "text/html");
    request->send(response);
  }
  else
  {
    request->send(404);
  }
}

void serveStaticFiles()
{
  server.serveStatic("/", SPIFFS, "/").setDefaultFile("index3.html");

  // Optional: Serve additional files if needed
  server.serveStatic("/scripts.js", SPIFFS, "/scripts.js");
  server.serveStatic("/styles.css", SPIFFS, "/styles.css");
}

void setup()
{

  ESP32Serial1.begin(9600, SERIAL_8N1, 3, 1);
  ESP32Serial2.begin(9600, SERIAL_8N1, 4, 2);
  ESP32Serial3.begin(9600, SERIAL_8N1, 16, 17);
  SPIFFS.begin();

  // Connect to Wi-Fi network
  WiFi.setTxPower(WIFI_POWER_19_5dBm);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  // Serial.println("Connected to WiFi");
  // Serial.println(WiFi.localIP());

  // Serve index.html file
  server.on("/", HTTP_GET, serveIndexHtml);
  serveStaticFiles();

  ws.onEvent(onWsEvent);
  server.addHandler(&ws);
  server.begin();

  // Set up OTA update
  ArduinoOTA.setHostname("energymeter"); // Set the hostname of your device

  ArduinoOTA
      .onStart([]()

               {
      String type;
      if (ArduinoOTA.getCommand() == U_FLASH)
        type = "sketch";
      else // U_SPIFFS
        type = "filesystem";

      // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
      Serial.println("Start updating " + type); })
      .onEnd([]()
             { Serial.println("\nEnd"); })
      .onProgress([](unsigned int progress, unsigned int total)
                  { Serial.printf("Progress: %u%%\r", (progress / (total / 100))); })
      .onError([](ota_error_t error)
               {
      Serial.printf("Error[%u]: ", error);
      if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
      else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
      else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
      else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
      else if (error == OTA_END_ERROR) Serial.println("End Failed"); });
  ArduinoOTA.begin();

  for (int i = 0; i < MAX_PZEM; i++)
  {
    lastMeasurementTime[i] = 0;
  }
}

void loop()
{
  ArduinoOTA.handle(); // Check for OTA updates
  ws.cleanupClients();

  static unsigned long prevTime = 0;
  if (millis() - prevTime >= 1000)
  {

    StaticJsonDocument<300> doc;
    JsonArray arr = doc.to<JsonArray>();

    for (int i = 0; i < 3; i++)
    {

      CONSOLE_SERIAL.print("Custom Address:");
      CONSOLE_SERIAL.println(pzem[i].readAddress(), HEX);

      // Read the data from the sensor
      float voltage = pzem[i].voltage();
      float current = pzem[i].current();
      float power = pzem[i].power();
      float energy = pzem[i].energy();
      float frequency = pzem[i].frequency();
      float pf = pzem[i].pf();

      // Check if the data is valid
      if (isnan(voltage))
      {
        CONSOLE_SERIAL.println("Error reading voltage");
      }
      else if (isnan(current))
      {
        CONSOLE_SERIAL.println("Error reading current");
      }
      else if (isnan(power))
      {
        CONSOLE_SERIAL.println("Error reading power");
      }
      else if (isnan(energy))
      {
        CONSOLE_SERIAL.println("Error reading energy");
      }
      else if (isnan(frequency))
      {
        CONSOLE_SERIAL.println("Error reading frequency");
      }
      else if (isnan(pf))
      {
        CONSOLE_SERIAL.println("Error reading power factor");
      }
      else
      {

        // Print the values to the Serial console
        CONSOLE_SERIAL.print("Voltage: ");
        CONSOLE_SERIAL.print(voltage);
        CONSOLE_SERIAL.println("V");
        CONSOLE_SERIAL.print("Current: ");
        CONSOLE_SERIAL.print(current);
        CONSOLE_SERIAL.println("A");
        CONSOLE_SERIAL.print("Power: ");
        CONSOLE_SERIAL.print(power);
        CONSOLE_SERIAL.println("W");
        CONSOLE_SERIAL.print("Energy: ");
        CONSOLE_SERIAL.print(energy, 3);
        CONSOLE_SERIAL.println("kWh");
        CONSOLE_SERIAL.print("Frequency: ");
        CONSOLE_SERIAL.print(frequency, 1);
        CONSOLE_SERIAL.println("Hz");
        CONSOLE_SERIAL.print("PF: ");
        CONSOLE_SERIAL.println(pf);
      }

      CONSOLE_SERIAL.println();

      JsonObject obj = arr.createNestedObject();
      obj["voltage"] = voltage;
      obj["current"] = current;
      obj["power"] = power;
      obj["frequency"] = frequency;
      obj["pf"] = pf;
    }

    String jsonStr;
    serializeJson(doc, jsonStr);
    Serial.print(jsonStr);
    ws.textAll(jsonStr);
    prevTime = millis();
  }
}