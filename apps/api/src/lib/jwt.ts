import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "weddq-dev-secret-change-me-please-32";

export type JwtPayload = {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function signToken(payload: JwtPayload, expiresIn: string | number = "30d") {
  return jwt.sign(payload, SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
