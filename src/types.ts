import * as Noble from "@abandonware/noble";

export type SensorData = {
  address: string;
  name: string;
  temperature?: number;
  humidity?: number;
  battery?: number;
};

type PeripheralMessage = {
  payload: {
    peripheral: Noble.Peripheral;
  };
};

export function isSupportedMessage(msg: any): msg is PeripheralMessage {
  return (
    typeof msg.payload === "object" &&
    msg.payload !== null &&
    msg.payload.peripheral
  );
}
