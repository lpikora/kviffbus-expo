import { connectionKey } from "@/utils/connection-key";

describe("connectionKey", () => {
  test("encodes from/to as a stable bit-packed string", () => {
    expect(connectionKey(1, 2)).toBe(String((1 << 16) | 2));
    expect(connectionKey(1, 2)).not.toBe(connectionKey(2, 1));
  });
});
