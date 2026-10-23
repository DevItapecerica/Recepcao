import { AppError } from "../types/errorTypes.js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const signatures: Record<string, (data: Buffer) => boolean> = {
  "image/jpeg": (data) => data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff,
  "image/png": (data) => data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  "image/gif": (data) => ["GIF87a", "GIF89a"].includes(data.subarray(0, 6).toString("ascii")),
  "image/webp": (data) => data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP",
};

export const assertValidImageData = (value?: string | null): void => {
  if (!value) return;
  if (/^https?:\/\/[^\s]{1,2048}$/i.test(value)) return;
  const match = /^data:(image\/(?:jpeg|png|gif|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) throw new AppError("Imagem inválida", 400, "INVALID_IMAGE");
  const data = Buffer.from(match[2], "base64");
  if (!data.length || data.length > MAX_IMAGE_BYTES || !signatures[match[1]]?.(data)) {
    throw new AppError("Imagem inválida ou maior que 5 MB", 400, "INVALID_IMAGE");
  }
};
