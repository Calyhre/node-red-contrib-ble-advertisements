import * as Red from "node-red";

export type Node = Red.Node & { name: string; address: string };
export type NodeDef = Red.NodeDef & { name: string; address: string };

export const SERVICE_UUID = "181a";
