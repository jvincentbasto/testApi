import { col as tokenBlacklist } from "../models/tokenBlacklist.js";

export const auth = async (req, reply) => {
  try {
    const decoded = await req.jwtVerify();
    const exists = await tokenBlacklist(req.server).findOne({
      jti: decoded.jti,
    });

    if (exists) throw new Error();
  } catch {
    throw req.server.httpErrors.unauthorized();
  }
};
