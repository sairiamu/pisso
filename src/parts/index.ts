// Import parts here to ensure they register themselves
import "./arduino-uno";
import "./breadboard";
import "./led";
import "./resistor";
import "./pushbutton";

// Displays
import "./7segment";
import "./ili9341";
import "./lcd1602";
import "./lcd2004";
import "./led-bar-graph";
import "./led-ring";
import "./neopixel";
import "./neopixel-matrix";
import "./rgb-led";
import "./ssd1306";

// Actuators
import "./biaxial-stepper";
import "./buzzer";
import "./servo";
import "./stepper-motor";
import "./relay";

// Sensors
import "./analog-joystick";
import "./dht22";
import "./hc-sr04";
import "./ir-receiver";
import "./ky-040";
import "./membrane-keypad";
import "./pir-motion-sensor";
import "./potentiometer";
import "./mpu6050";
import "./photoresistor";
import "./ntc-temperature-sensor";
import "./dip-switch-8";
import "./slide-switch";
import "./tilt-switch";
import "./slide-potentiometer";
import "./rotary-dialer";
import "./pushbutton-6mm";

export * from "./types";
export * from "./registry";
