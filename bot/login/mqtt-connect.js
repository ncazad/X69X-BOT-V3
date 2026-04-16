const { connectMqtt } = require("./mqtt-connect");

// Replace this with the actual Facebook MQTT URL const MQTT_URL = "wss://edge-mqtt.facebook.com:443";

// Your custom options if needed const options = { // Example: username, password, or session token if required // username: "", // password: "" };

// Create client with robust handlers const client = connectMqtt(MQTT_URL, options);

// Example subscription to FB message topic client.safeSubscribe("/t_ms", (err, granted) => { if (err) { console.error("Failed to subscribe /t_ms", err); } else { console.log("Subscribed to /t_ms"); } });

// Example message handler client.on("message", (topic, message) => { console.log(📩 MQTT Message [${topic}]: ${message.toString()}); });

module.exports = client;
