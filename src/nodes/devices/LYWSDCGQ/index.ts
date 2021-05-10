import { NodeAPI } from "node-red";

import { Node, NodeDef, SERVICE_UUID } from "./types";
import { SensorData, isSupportedMessage } from "../../../types";

module.exports = (RED: NodeAPI) => {
  function LywsdcgqNode(this: Node, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.name = config.name;
    this.address = config.address.replace(/-/g, ":").toLowerCase();

    const node = this;
    const sensor: SensorData = {
      name: node.name,
      address: node.address,
    };

    node.on("input", (msg) => {
      if (!isSupportedMessage(msg)) return;

      const { address, advertisement } = msg.payload.peripheral;
      if (address !== node.address) return;

      const serviceUuid = advertisement.serviceData[0].uuid;
      if (serviceUuid !== SERVICE_UUID) return;

      const data = new DataView(advertisement.serviceData[0].data.buffer);

      switch (data.getUint8(11)) {
        case 0x04:
          sensor.temperature = data.getInt16(14, true) / 10;
          break;
        case 0x06:
          sensor.humidity = Math.round(data.getInt16(14, true) / 10);
          break;
        case 0x0a:
          sensor.battery = data.getUint8(14);
          break;
        case 0x0d:
          sensor.temperature = data.getInt16(14, true) / 10;
          sensor.humidity = Math.round(data.getInt16(16, true) / 10);
          break;
        default:
          break;
      }
      node.send({ payload: { sensor } });
    });
  }

  RED.nodes.registerType("ble-advertisement-LYWSDCGQ", LywsdcgqNode);
};
