const mqtt = require('mqtt');

const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');

client.on('connect', () => {
    console.log('Connected to Mosquitto WebSocket');
    client.subscribe('test/sync');
    client.publish('test/sync', 'hello world');
});

client.on('message', (topic, msg) => {
    console.log('Received:', topic, msg.toString());
    process.exit(0);
});

client.on('error', (err) => {
    console.error('MQTT Error:', err);
    process.exit(1);
});

setTimeout(() => {
    console.error('Timeout!');
    process.exit(1);
}, 5000);
