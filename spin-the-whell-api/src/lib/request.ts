import type { Request } from "express";
import { createPrivateHash } from "./crypto.js";
import { getEnv } from "../config/env.js";

export function getRequestIp(request: Request) {
  return request.ip || request.socket.remoteAddress || "unknown";
}

export function getIpHash(request: Request) {
  return createPrivateHash(getRequestIp(request), getEnv().IP_HASH_SECRET);
}
