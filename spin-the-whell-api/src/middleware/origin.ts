import type { RequestHandler } from "express";
import { getEnv } from "../config/env.js";
import { AppError } from "../lib/errors.js";

export const requireTrustedOrigin: RequestHandler = (request, _response, next) => {
  const origin = request.get("origin");
  const requestedWith = request.get("x-requested-with");
  const fetchSite = request.get("sec-fetch-site");
  if (
    origin !== getEnv().FRONTEND_ORIGIN
    || requestedWith !== "SpinTheWheel"
    || fetchSite === "cross-site"
  ) {
    throw new AppError(403, "UNTRUSTED_ORIGIN", "Request origin is not allowed.");
  }
  next();
};
