import { Node, NodeAPI, NodeDef } from "node-red";
import noble from "@abandonware/noble";

import { SERVICE_UUID as LYWSD03MMC_UUID } from "../devices/LYWSD03MMC/types";
import { SERVICE_UUID as LYWSDCGQ_UUID } from "../devices/LYWSDCGQ/types";

type BLEAdvertisementNode = Node;

const ALLOW_DUPLICATES = true;

module.exports = (RED: NodeAPI) => {
  function BLEAdvertisementNode(this: BLEAdvertisementNode, config: NodeDef) {
    RED.nodes.createNode(this, config);

    const node = this;

    function onStartScanning(error?: Error) {
      if (error) {
        console.error(error);
        return process.exit();
      }
    }

    function startScanning() {
      noble.startScanning(
        [LYWSD03MMC_UUID, LYWSDCGQ_UUID],
        ALLOW_DUPLICATES,
        onStartScanning
      );
    }

    noble.on("discover", (peripheral) => {
      node.send({
        payload: {
          peripheral: {
            id: peripheral.id,
            uuid: peripheral.uuid,
            address: peripheral.address.replace(/-/g, ":"),
            addressType: peripheral.addressType,
            connectable: peripheral.connectable,
            advertisement: peripheral.advertisement,
            rssi: peripheral.rssi,
            services: peripheral.services,
            state: peripheral.state,
          },
        },
      });
    });

    noble.on("stateChange", (state) => {
      if (state === "poweredOn") {
        startScanning();
      }
    });

    noble.on("scanStop", () => {
      startScanning();
    });
  }

  RED.nodes.registerType("ble-advertisement", BLEAdvertisementNode);
};
