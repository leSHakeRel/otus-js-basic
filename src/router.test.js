// router.test.js
import { router } from "./router.js";
import { bus } from "./eventbus.js";

// Мокаем eventbus
jest.mock("./eventbus.js", () => ({
  bus: {
    emit: jest.fn(),
  },
}));

describe("Router", () => {
  let originalHash;
  let originalPathname;
  let originalAddEventListener;

  beforeEach(() => {
    // Сохраняем оригинальное состояние
    originalHash = window.location.hash;
    originalPathname = window.location.pathname;

    // Сбрасываем hash
    window.location.hash = "";

    // Мокаем addEventListener
    originalAddEventListener = document.addEventListener;
    document.addEventListener = jest.fn();
    window.addEventListener = jest.fn();

    // Очищаем маршруты перед каждым тестом
    router.routes.clear();
    router.notFoundHandler = null;
    router.currentRoute = null;

    jest.clearAllMocks();
  });

  afterEach(() => {
    // Восстанавливаем
    window.location.hash = originalHash;
    // Восстанавливаем pathname через replaceState
    window.history.replaceState({}, "", originalPathname);
    document.addEventListener = originalAddEventListener;
  });

  describe("addRoute", () => {
    it("should add route to routes map", () => {
      const handler = jest.fn();
      router.addRoute("/test", handler);

      expect(router.routes.get("/test")).toBe(handler);
    });

    it("should return router instance for chaining", () => {
      const result = router.addRoute("/test", jest.fn());

      expect(result).toBe(router);
    });
  });

  describe("setNotFoundHandler", () => {
    it("should set not found handler", () => {
      const handler = jest.fn();
      router.setNotFoundHandler(handler);

      expect(router.notFoundHandler).toBe(handler);
    });
  });

  describe("matchRoute", () => {
    it("should match exact route", () => {
      const result = router.matchRoute("/about", "/about");

      expect(result).toEqual({ matched: true, params: {} });
    });

    it("should match route with params", () => {
      const result = router.matchRoute("/weather/:city", "/weather/moscow");

      expect(result).toEqual({ matched: true, params: { city: "moscow" } });
    });

    it("should match root route", () => {
      const result = router.matchRoute("/", "/");

      expect(result).toEqual({ matched: true, params: {} });
    });

    it("should not match when pattern length differs", () => {
      const result = router.matchRoute(
        "/weather/:city",
        "/weather/moscow/extra",
      );

      expect(result).toEqual({ matched: false });
    });

    it("should not match when segments differ", () => {
      const result = router.matchRoute("/weather/:city", "/about/moscow");

      expect(result).toEqual({ matched: false });
    });

    it("should decode URI parameters", () => {
      const result = router.matchRoute(
        "/weather/:city",
        "/weather/Moscow%20City",
      );

      expect(result).toEqual({
        matched: true,
        params: { city: "Moscow City" },
      });
    });
  });

  describe("getCurrentParams", () => {
    it("should return current route params", () => {
      router.currentRoute = { params: { city: "moscow" } };

      const params = router.getCurrentParams();

      expect(params).toEqual({ city: "moscow" });
    });

    it("should return empty object when no current route", () => {
      const params = router.getCurrentParams();

      expect(params).toEqual({});
    });
  });

  describe("getCurrentPath", () => {
    it("should return current route path", () => {
      router.currentRoute = { pathname: "/test" };

      const path = router.getCurrentPath();

      expect(path).toBe("/test");
    });

    it("should return default path when no current route", () => {
      const path = router.getCurrentPath();

      expect(path).toBe("/");
    });
  });

  describe("showError", () => {
    it("should emit weather:error event with error message", () => {
      const error = new Error("Test error");
      router.showError(error);

      expect(bus.emit).toHaveBeenCalledWith("weather:error", "Test error");
    });

    it("should use default message when error has no message", () => {
      const error = {};
      router.showError(error);

      expect(bus.emit).toHaveBeenCalledWith(
        "weather:error",
        "Ошибка навигации",
      );
    });
  });

  describe("goBack", () => {
    it("should call history.back", () => {
      const backSpy = jest.spyOn(window.history, "back");

      router.goBack();

      expect(backSpy).toHaveBeenCalled();
      backSpy.mockRestore();
    });
  });

  describe("navigate", () => {
    it("should navigate using hash routing", () => {
      router.navigate("/test");

      expect(window.location.hash).toBe("#!/test");
    });
  });

  describe("route", () => {
    it("should call matched route handler", async () => {
      const handler = jest.fn().mockResolvedValue();
      router.addRoute("/test", handler);

      await router.route("/test");

      expect(handler).toHaveBeenCalledWith("/test", {});
    });

    it("should pass params to route handler", async () => {
      const handler = jest.fn().mockResolvedValue();
      router.addRoute("/weather/:city", handler);

      await router.route("/weather/moscow");

      expect(handler).toHaveBeenCalledWith("/weather/moscow", {
        city: "moscow",
      });
    });

    it("should call notFoundHandler when route not found", async () => {
      const notFoundHandler = jest.fn().mockResolvedValue();
      router.setNotFoundHandler(notFoundHandler);

      await router.route("/non-existent");

      expect(notFoundHandler).toHaveBeenCalledWith("/non-existent");
    });

    it("should emit routeChanged event on successful route", async () => {
      const handler = jest.fn().mockResolvedValue();
      router.addRoute("/test", handler);

      await router.route("/test");

      expect(bus.emit).toHaveBeenCalledWith("router:routeChanged", {
        pathname: "/test",
        params: {},
      });
    });
  });

  describe("handleHashChange", () => {
    it("should handle empty hash", () => {
      window.location.hash = "";
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue();

      router.handleHashChange();

      expect(routeSpy).toHaveBeenCalledWith("/");
      routeSpy.mockRestore();
    });

    it("should handle hash with path", () => {
      window.location.hash = "#!/weather/moscow";
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue();

      router.handleHashChange();

      expect(routeSpy).toHaveBeenCalledWith("weather/moscow");
      routeSpy.mockRestore();
    });
  });

  describe("handlePathChange", () => {
    it("should handle root path", () => {
      // Используем pushState для изменения pathname
      window.history.pushState({}, "", "/");
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue();

      router.handlePathChange();

      expect(routeSpy).toHaveBeenCalledWith("/");
      routeSpy.mockRestore();
    });

    it("should handle nested path", () => {
      window.history.pushState({}, "", "/weather/moscow");
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue();

      router.handlePathChange();

      expect(routeSpy).toHaveBeenCalledWith("weather/moscow");
      routeSpy.mockRestore();
    });

    it("should handle path with trailing slash", () => {
      window.history.pushState({}, "", "/weather/moscow/");
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue();

      router.handlePathChange();

      expect(routeSpy).toHaveBeenCalledWith("weather/moscow");
      routeSpy.mockRestore();
    });
  });

  describe("handleRouteChange", () => {
    it("should call handleHashChange when useHashRouting is true", () => {
      router.useHashRouting = true;
      const hashChangeSpy = jest.spyOn(router, "handleHashChange");

      router.handleRouteChange();

      expect(hashChangeSpy).toHaveBeenCalled();
      hashChangeSpy.mockRestore();
    });

    it("should call handlePathChange when useHashRouting is false", () => {
      router.useHashRouting = false;
      const pathChangeSpy = jest.spyOn(router, "handlePathChange");

      router.handleRouteChange();

      expect(pathChangeSpy).toHaveBeenCalled();
      pathChangeSpy.mockRestore();
    });
  });

  describe("handleInitialRoute", () => {
    it("should call handleHashChange when useHashRouting is true", () => {
      router.useHashRouting = true;
      const hashChangeSpy = jest.spyOn(router, "handleHashChange");

      router.handleInitialRoute();

      expect(hashChangeSpy).toHaveBeenCalled();
      hashChangeSpy.mockRestore();
    });

    it("should call handlePathChange when useHashRouting is false", () => {
      router.useHashRouting = false;
      const pathChangeSpy = jest.spyOn(router, "handlePathChange");

      router.handleInitialRoute();

      expect(pathChangeSpy).toHaveBeenCalled();
      pathChangeSpy.mockRestore();
    });
  });
});
