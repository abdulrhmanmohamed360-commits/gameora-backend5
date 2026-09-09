import { onRequest } from "firebase-functions/v2/https";
import app from "./app";

// بيتنشر كـ Function اسمها "api"، وFirebase Hosting بيعمل rewrite لـ /v1/** عليها
// (شايف firebase.json) عشان يديك رابط نضيف زي:
//   https://YOUR-PROJECT.web.app/v1/games
export const api = onRequest({ region: "us-central1", cors: true }, app);
