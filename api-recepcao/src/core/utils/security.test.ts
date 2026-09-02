import assert from "node:assert/strict";
import test from "node:test";
import { assertStrongPassword } from "./passwordPolicy.js";
import { assertValidImageData } from "./imageData.js";

test("rejects weak passwords and accepts the configured policy", () => {
  assert.throws(() => assertStrongPassword("weakpassword"));
  assert.throws(() => assertStrongPassword("Short1!"));
  assert.doesNotThrow(() => assertStrongPassword("SenhaForte1!"));
});

test("validates image content instead of trusting only the MIME label", () => {
  const png = `data:image/png;base64,${Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString("base64")}`;
  const fake = `data:image/png;base64,${Buffer.from("not a png").toString("base64")}`;
  assert.doesNotThrow(() => assertValidImageData(png));
  assert.throws(() => assertValidImageData(fake));
});
