import * as svc from "./service.js";

// core
export const register = (f) => async (req, reply) => {
  const res = await svc.register(f, req);

  return res;
};
export const login = (f) => async (req, reply) => {
  const body = req.body;
  const res = await svc.login(f, body);

  return res;
};
export const logout = (f) => async (req, reply) => {
  const res = await svc.logout(f, req);
  return res;
};

// confirmation & reset
export const confirmEmail = (f) => async (req, reply) => {
  const token = req.params.token;
  const res = await svc.confirmEmail(f, token);

  return res;
};
export const forgotPassword = (f) => async (req, reply) => {
  const email = req.body.email;
  const res = await svc.forgotPassword(f, email);

  return res;
};
export const resetPassword = (f) => async (req, reply) => {
  const token = req.params.token;
  const password = req.body.password;

  const res = await svc.resetPassword(f, token, password);
  return res;
};
