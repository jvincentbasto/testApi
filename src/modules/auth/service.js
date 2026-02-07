import { col as users } from "../../shared/models/users.js";
import { col as tokenBlacklist } from "../../shared/models/tokenBlacklist.js";

import { hash, compare } from "../../utils/password.js";
import { randomUUID } from "node:crypto";

// core
export const register = async (f, req) => {
  const body = req.body;

  //
  const pluginUpload = f.upload();
  const uploadOptions = { table: "users", field: "image" };

  const user = {
    email: body.email,
    password: await hash(body.password),
    //
    // role: "user",
    // customer: null,
    image: null,
    // email verification
    emailVerified: false,
    emailToken: randomUUID(),
    // dates
    createdAt: new Date(),
    deletedAt: null,
  };

  // Handle profile image
  const files = Array.isArray(body.image) ? body.image : [body.image];
  const uploaded = req.isMultipart()
    ? await pluginUpload.upload.multiple(files, uploadOptions)
    : [];
  if (uploaded.length) user.image = uploaded[0];

  await users(f).insertOne(user);
  return { ...user, password: undefined };
};
export const login = async (f, d) => {
  const user = await users(f).findOne({ email: d.email, deletedAt: null });

  const match = await compare(d.password, user.password);
  if (!user || !match) {
    throw f.httpErrors.unauthorized();
  }

  const token = f.jwt.sign(
    { userId: user._id, jti: randomUUID() },
    {
      // expiresIn: "1h",
      expiresIn: "5h",
    },
  );
  return { ...user, password: undefined, token };
};
export const logout = async (f, req) => {
  const token = req.headers.authorization?.split(" ")[1] || "";

  const decoded = f.jwt.decode(token);
  await tokenBlacklist(f).insertOne({
    jti: decoded.jti,
    userId: decoded.userId,
    expiresAt: new Date(decoded.exp * 1000),
  });

  req.headers.authorization = req.headers.authorization.replace("Bearer ", "");
  return { success: true };
};

// confirmation & reset
export const confirmEmail = async (f, token) => {
  await users(f).updateOne(
    { emailToken: token },
    { $set: { emailVerified: true }, $unset: { emailToken: "" } },
  );

  return { success: true };
};
export const forgotPassword = async (f, email) => {
  const token = randomUUID();
  await users(f).updateOne({ email }, { $set: { resetToken: token } });

  return { token };
};
export const resetPassword = async (f, token, password) => {
  await users(f).updateOne(
    { resetToken: token },
    {
      $set: { password: await hash(password) },
      $unset: { resetToken: "" },
    },
  );

  return { success: true };
};
