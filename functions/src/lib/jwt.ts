import jwt from "jsonwebtoken";

// مهم: غيّر القيمة دي في ملف functions/.env (JWT_SECRET=...) قبل النشر النهائي.
// لو الملف مش موجود بيستخدم قيمة افتراضية للتجربة بس - متسيبهاش في الإنتاج.
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me-before-production";
const EXPIRES_IN = "30d";

export interface TokenPayload {
  uid: string;
}

export function signToken(uid: string): string {
  return jwt.sign({ uid } as TokenPayload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
