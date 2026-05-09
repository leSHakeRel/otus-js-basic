/// <reference types="jest" />
import { storage, StorageKeys } from "./storageService.ts";

describe("StorageService", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("set", () => {
    it("should store string value with prefix", () => {
      const result = storage.set("testKey", "testValue");

      expect(result).toBe(true);
      expect(localStorage.getItem("weather_app_testKey")).toBe("testValue");
    });

    it("should store object value as JSON with prefix", () => {
      const obj = { name: "Moscow", temp: 20 };
      const result = storage.set("testKey", obj);

      expect(result).toBe(true);
      const storedValue = localStorage.getItem("weather_app_testKey");
      expect(storedValue).toBeTruthy();
      expect(JSON.parse(storedValue!)).toEqual(obj);
    });

    it("should handle null value", () => {
      const result = storage.set("testKey", null);

      expect(result).toBe(true);
      expect(localStorage.getItem("weather_app_testKey")).toBe("null");
    });

    it("should handle undefined value", () => {
      const result = storage.set("testKey", undefined);

      expect(result).toBe(true);
      expect(localStorage.getItem("weather_app_testKey")).toBe("undefined");
    });
  });

  describe("get", () => {
    it("should retrieve stored string value", () => {
      localStorage.setItem("weather_app_testKey", "testValue");

      const result = storage.get("testKey");

      expect(result).toBe("testValue");
    });

    it("should retrieve and parse JSON object", () => {
      const obj = { name: "Moscow", temp: 20 };
      localStorage.setItem("weather_app_testKey", JSON.stringify(obj));

      const result = storage.get("testKey");

      expect(result).toEqual(obj);
    });

    it("should return defaultValue when key does not exist", () => {
      const result = storage.get("nonExistentKey", "default");

      expect(result).toBe("default");
    });

    it("should return null as default when key does not exist and no default provided", () => {
      const result = storage.get("nonExistentKey");

      expect(result).toBeNull();
    });

    it("should handle invalid JSON gracefully", () => {
      localStorage.setItem("weather_app_testKey", "invalid{json");

      const result = storage.get("testKey");

      expect(result).toBe("invalid{json");
    });

    it("should handle storage error gracefully", () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error("Storage error");
      };

      const result = storage.get("testKey", "default");

      expect(result).toBe("default");

      localStorage.getItem = originalGetItem;
    });
  });

  describe("remove", () => {
    it("should remove existing key", () => {
      localStorage.setItem("weather_app_testKey", "value");

      const result = storage.remove("testKey");

      expect(result).toBe(true);
      expect(localStorage.getItem("weather_app_testKey")).toBeNull();
    });

    it("should return true even if key does not exist", () => {
      const result = storage.remove("nonExistentKey");

      expect(result).toBe(true);
    });
  });

  describe("has", () => {
    it("should return true when key exists", () => {
      localStorage.setItem("weather_app_testKey", "value");

      expect(storage.has("testKey")).toBe(true);
    });

    it("should return false when key does not exist", () => {
      expect(storage.has("nonExistentKey")).toBe(false);
    });
  });

  describe("clear", () => {
    it("should clear all app keys", () => {
      localStorage.setItem("weather_app_key1", "value1");
      localStorage.setItem("weather_app_key2", "value2");
      localStorage.setItem("other_key", "otherValue");

      const result = storage.clear();

      expect(result).toBe(true);
      expect(localStorage.getItem("weather_app_key1")).toBeNull();
      expect(localStorage.getItem("weather_app_key2")).toBeNull();
      expect(localStorage.getItem("other_key")).toBe("otherValue");
    });

    it("should handle empty storage", () => {
      const result = storage.clear();

      expect(result).toBe(true);
    });
  });

  describe("_getPrefixedKey", () => {
    it("should add weather_app_ prefix", () => {
      expect(storage["_getPrefixedKey"]("test")).toBe("weather_app_test");
    });
  });

  describe("StorageKeys export", () => {
    it("should export SEARCH_HISTORY constant", () => {
      expect(StorageKeys.SEARCH_HISTORY).toBe("searchHistory");
    });
  });
});
