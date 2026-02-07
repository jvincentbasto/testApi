import * as ctl from "../modules/auth/controller.js";
import * as schema from "../modules/auth/schema.js";

export default async function (f) {
  const prefix = "auth";
  const options = {};

  // core
  f.post(
    `/${prefix}/register`,
    { ...options, schema: { body: schema.registerSchema } },
    ctl.register(f),
  );
  f.post(
    `/${prefix}/login`,
    { ...options, schema: { body: schema.loginSchema } },
    ctl.login(f),
  );
  f.post(`/${prefix}/logout`, { ...options }, ctl.logout(f));

  // confirmation & reset
  f.get(`/${prefix}/confirm-email/:token`, { ...options }, ctl.confirmEmail(f));
  f.post(`/${prefix}/forgot-password`, { ...options }, ctl.forgotPassword(f));
  f.post(
    `/${prefix}/reset-password/:token`,
    { ...options },
    ctl.resetPassword(f),
  );
}
