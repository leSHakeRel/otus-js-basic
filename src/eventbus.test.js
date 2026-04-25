import { bus } from "./eventbus";

describe("EventBus", () => {
  beforeEach(() => {
    bus.clear();
  });

  describe("on", () => {
    it("should subscribe to an event", () => {
      const callback = jest.fn();
      bus.on("test", callback);
      bus.emit("test");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should throw error if callback is not a function", () => {
      expect(() => bus.on("test", null)).toThrow("Callback must be a function");
      expect(() => bus.on("test", "not a function")).toThrow(
        "Callback must be a function",
      );
      expect(() => bus.on("test", {})).toThrow("Callback must be a function");
    });

    it("should return unsubscribe function", () => {
      const callback = jest.fn();
      const unsubscribe = bus.on("test", callback);

      bus.emit("test");
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      bus.emit("test");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should support multiple subscribers to same event", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      bus.on("test", callback1);
      bus.on("test", callback2);
      bus.emit("test");

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should support context option", () => {
      const context = { value: 42 };
      const callback = jest.fn(function () {
        return this.value;
      });

      bus.on("test", callback, { context });
      bus.emit("test");

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.results[0].value).toBe(42);
    });
  });

  describe("once", () => {
    it("should execute callback only once", () => {
      const callback = jest.fn();

      bus.once("test", callback);
      bus.emit("test");
      bus.emit("test");
      bus.emit("test");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should return unsubscribe function", () => {
      const callback = jest.fn();
      const unsubscribe = bus.once("test", callback);

      bus.emit("test");
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      bus.emit("test");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should support context option", () => {
      const context = { value: 100 };
      const callback = jest.fn(function () {
        return this.value;
      });

      bus.once("test", callback, { context });
      bus.emit("test");

      expect(callback.mock.results[0].value).toBe(100);
    });
  });

  describe("off", () => {
    it("should remove specific callback", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      bus.on("test", callback1);
      bus.on("test", callback2);
      bus.off("test", callback1);
      bus.emit("test");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should remove all listeners for event when no callback provided", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      bus.on("test", callback1);
      bus.on("test", callback2);
      bus.off("test");
      bus.emit("test");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it("should do nothing if event doesn't exist", () => {
      const callback = jest.fn();

      expect(() => bus.off("nonexistent", callback)).not.toThrow();
      expect(() => bus.off("nonexistent")).not.toThrow();
    });

    it("should return this for chaining", () => {
      const result = bus.off("test");
      expect(result).toBe(bus);
    });
  });

  describe("emit", () => {
    it("should call listeners with arguments", () => {
      const callback = jest.fn();
      bus.on("test", callback);
      bus.emit("test", 1, "two", { three: 3 });

      expect(callback).toHaveBeenCalledWith(1, "two", { three: 3 });
    });

    it("should return false if no listeners", () => {
      const result = bus.emit("nonexistent");
      expect(result).toBe(false);
    });

    it("should return true if listeners exist", () => {
      bus.on("test", () => {});
      const result = bus.emit("test");
      expect(result).toBe(true);
    });

    it("should call listeners in correct context by default", () => {
      const callback = jest.fn();
      bus.on("test", callback);
      bus.emit("test");

      expect(callback.mock.instances[0]).toBe(bus);
    });

    it("should handle once listeners and remove them after emit", () => {
      const callback = jest.fn();
      bus.once("test", callback);

      bus.emit("test");
      bus.emit("test");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should remove event entry when all once listeners are consumed", () => {
      bus.once("test", jest.fn());
      bus.emit("test");

      expect(bus.events.has("test")).toBe(false);
    });

    it("should keep event when there are remaining non-once listeners", () => {
      const onceCallback = jest.fn();
      const regularCallback = jest.fn();

      bus.once("test", onceCallback);
      bus.on("test", regularCallback);
      bus.emit("test");

      expect(bus.events.has("test")).toBe(true);
      expect(regularCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("emitAsync", () => {
    it("should handle async callbacks", async () => {
      const callback = jest.fn().mockResolvedValue("result");
      bus.on("test", callback);

      const results = await bus.emitAsync("test", 1, 2);

      expect(callback).toHaveBeenCalledWith(1, 2);
      expect(results).toEqual(["result"]);
    });

    it("should return empty array if no listeners", async () => {
      const results = await bus.emitAsync("nonexistent");
      expect(results).toEqual([]);
    });

    it("should handle errors and continue execution", async () => {
      const errorCallback = jest
        .fn()
        .mockRejectedValue(new Error("Async error"));
      const successCallback = jest.fn().mockResolvedValue("success");

      bus.on("test", errorCallback);
      bus.on("test", successCallback);

      const results = await bus.emitAsync("test");

      expect(results[0]).toBeInstanceOf(Error);
      expect(results[1]).toBe("success");
    });

    it("should handle once listeners in async mode", async () => {
      const onceCallback = jest.fn().mockResolvedValue("once");
      const regularCallback = jest.fn().mockResolvedValue("regular");

      bus.once("test", onceCallback);
      bus.on("test", regularCallback);

      await bus.emitAsync("test");
      await bus.emitAsync("test");

      expect(onceCallback).toHaveBeenCalledTimes(1);
      expect(regularCallback).toHaveBeenCalledTimes(2);
    });

    it("should call listeners in correct context", async () => {
      const context = { name: "test" };
      const callback = jest.fn(function () {
        return this.name;
      });

      bus.on("test", callback, { context });
      const results = await bus.emitAsync("test");

      expect(results[0]).toBe("test");
    });
  });

  describe("clear", () => {
    it("should remove all events", () => {
      bus.on("event1", jest.fn());
      bus.on("event2", jest.fn());
      bus.on("event3", jest.fn());

      bus.clear();

      expect(bus.events.size).toBe(0);
    });

    it("should return this for chaining", () => {
      const result = bus.clear();
      expect(result).toBe(bus);
    });
  });
});
