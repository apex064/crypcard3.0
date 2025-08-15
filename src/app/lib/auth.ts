// lib/auth.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Hash a plain text password
export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

// Compare a plain text password to a hashed password
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

// Sign a JWT token
export function signToken(payload: object): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Verify a JWT token
export function verifyToken(token: string): string | JwtPayload {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

