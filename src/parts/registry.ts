import { PartDefinition } from "./types";
import { SEVEN_SEGMENT_DEFINITION } from "./7segment";
import { ANALOG_JOYSTICK_DEFINITION } from "./analog-joystick";
import { ARDUINO_UNO_DEFINITION } from "./arduino-uno";
import { BIAXIAL_STEPPER_DEFINITION } from "./biaxial-stepper";
import { BREADBOARD_DEFINITION } from "./breadboard";
import { BUZZER_DEFINITION } from "./buzzer";
import { DHT22_DEFINITION } from "./dht22";
import { DIP_SWITCH_8_DEFINITION } from "./dip-switch-8";
import { HC_SR04_DEFINITION } from "./hc-sr04";
import { ILI9341_DEFINITION } from "./ili9341";
import { IR_RECEIVER_DEFINITION } from "./ir-receiver";
import { KY_040_DEFINITION } from "./ky-040";
import { LCD1602_DEFINITION } from "./lcd1602";
import { LCD2004_DEFINITION } from "./lcd2004";
import { LED_BAR_GRAPH_DEFINITION } from "./led-bar-graph";
import { LED_RING_DEFINITION } from "./led-ring";
import { LED_DEFINITION } from "./led";
import { MEMBRANE_KEYPAD_DEFINITION } from "./membrane-keypad";
import { MPU6050_DEFINITION } from "./mpu6050";
import { NEOPIXEL_MATRIX_DEFINITION } from "./neopixel-matrix";
import { NEOPIXEL_DEFINITION } from "./neopixel";
import { NTC_TEMPERATURE_SENSOR_DEFINITION } from "./ntc-temperature-sensor";
import { PHOTORESISTOR_DEFINITION } from "./photoresistor";
import { PIR_MOTION_SENSOR_DEFINITION } from "./pir-motion-sensor";
import { POTENTIOMETER_DEFINITION } from "./potentiometer";
import { PUSHBUTTON_6MM_DEFINITION } from "./pushbutton-6mm";
import { PUSHBUTTON_DEFINITION } from "./pushbutton";
import { RELAY_DEFINITION } from "./relay";
import { RESISTOR_DEFINITION } from "./resistor";
import { RGB_LED_DEFINITION } from "./rgb-led";
import { ROTARY_DIALER_DEFINITION } from "./rotary-dialer";
import { SERVO_DEFINITION } from "./servo";
import { SLIDE_POTENTIOMETER_DEFINITION } from "./slide-potentiometer";
import { SLIDE_SWITCH_DEFINITION } from "./slide-switch";
import { SSD1306_DEFINITION } from "./ssd1306";
import { STEPPER_MOTOR_DEFINITION } from "./stepper-motor";
import { TILT_SWITCH_DEFINITION } from "./tilt-switch";

const ALL_PART_DEFINITIONS: PartDefinition[] = [
  SEVEN_SEGMENT_DEFINITION,
  ANALOG_JOYSTICK_DEFINITION,
  ARDUINO_UNO_DEFINITION,
  BIAXIAL_STEPPER_DEFINITION,
  BREADBOARD_DEFINITION,
  BUZZER_DEFINITION,
  DHT22_DEFINITION,
  DIP_SWITCH_8_DEFINITION,
  HC_SR04_DEFINITION,
  ILI9341_DEFINITION,
  IR_RECEIVER_DEFINITION,
  KY_040_DEFINITION,
  LCD1602_DEFINITION,
  LCD2004_DEFINITION,
  LED_BAR_GRAPH_DEFINITION,
  LED_RING_DEFINITION,
  LED_DEFINITION,
  MEMBRANE_KEYPAD_DEFINITION,
  MPU6050_DEFINITION,
  NEOPIXEL_MATRIX_DEFINITION,
  NEOPIXEL_DEFINITION,
  NTC_TEMPERATURE_SENSOR_DEFINITION,
  PHOTORESISTOR_DEFINITION,
  PIR_MOTION_SENSOR_DEFINITION,
  POTENTIOMETER_DEFINITION,
  PUSHBUTTON_6MM_DEFINITION,
  PUSHBUTTON_DEFINITION,
  RELAY_DEFINITION,
  RESISTOR_DEFINITION,
  RGB_LED_DEFINITION,
  ROTARY_DIALER_DEFINITION,
  SERVO_DEFINITION,
  SLIDE_POTENTIOMETER_DEFINITION,
  SLIDE_SWITCH_DEFINITION,
  SSD1306_DEFINITION,
  STEPPER_MOTOR_DEFINITION,
  TILT_SWITCH_DEFINITION,
];

/**
 * Global registry of all available parts.
 * Parts are indexed by their unique type string (e.g., "wokwi-arduino-uno").
 */
export const PARTS_REGISTRY = new Map<string, PartDefinition>(
  ALL_PART_DEFINITIONS.map((def) => [def.type, def])
);

/**
 * Returns all registered parts as an array, grouped by category.
 */
export const getRegisteredParts = (): PartDefinition[] => {
  return Array.from(PARTS_REGISTRY.values());
};
