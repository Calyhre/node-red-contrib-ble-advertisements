import { NodeAPI } from "node-red";

import { Node, NodeDef, SERVICE_UUID } from "./types";
import { SensorData, isSupportedMessage } from "../../../types";

module.exports = (RED: NodeAPI) => {
  function Lywsd03mmcNode(this: Node, config: NodeDef) {
    RED.nodes.createNode(this, config);

    this.name = config.name;
    this.address = config.address.replace(":", "-").toLowerCase();

    const node = this;
    const sensor: SensorData = {
      name: node.name,
      address: node.address,
    };

    let counter = -1;

    node.on("input", (msg) => {
      if (!isSupportedMessage(msg)) return;

      const { address, advertisement } = msg.payload.peripheral;
      if (address !== node.address) return;

      const serviceUuid = advertisement.serviceData[0].uuid;
      if (serviceUuid !== SERVICE_UUID) return;

      const data = new DataView(advertisement.serviceData[0].data.buffer);
      if (data.getUint8(13) === counter) return;

      sensor.temperature = Math.round(data.getInt16(6, true) / 10) / 10;
      sensor.humidity = Math.round(data.getUint16(8, true) / 10) / 10;
      sensor.battery = data.getUint8(12);
      counter = data.getUint8(13);

      node.send({ payload: { sensor } });
    });
  }

  RED.nodes.registerType("ble-advertisement-LYWSD03MMC", Lywsd03mmcNode);
};
