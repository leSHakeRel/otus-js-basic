/// <reference types="jest" />
import { router } from "./router.ts";
import { bus } from "./eventbus.ts";

jest.mock("./eventbus.ts", () => ({
  bus: {
    emit: jest.fn(),
  },
}));

describe("Router", () => {
  let originalHash: string;
  let originalPathname: string;
  let originalAddEventListener: typeof document.addEventListener;
  let originalWindowAddEventListener: typeof window.addEventListener;

  beforeEach(() => {
    originalHash = window.location.hash;
    originalPathname = window.location.pathname;

    window.location.hash = "";

    originalAddEventListener = document.addEventListener;
    document.addEventListener = jest.fn();
    originalWindowAddEventListener = window.addEventListener;
    window.addEventListener = jest.fn();

    router["routes"].clear();
    router["notFoundHandler"] = null;
    router["currentRoute"] = null;

    jest.clearAllMocks();
  });

  afterEach(() => {
    window.location.hash = originalHash;
    window.history.replaceState({}, "", originalPathname);
    document.addEventListener = originalAddEventListener;
    window.addEventListener = originalWindowAddEventListener;
  });

  describe("addRoute", () => {
    it("should add route to routes map", () => {
      const handler = jest.fn();
      router.addRoute("/test", handler);

      expect(router["routes"].get("/test")).toBe(handler);
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

      expect(router["notFoundHandler"]).toBe(handler);
    });
  });

  describe("matchRoute", () => {
    it("should match exact route", () => {
      const result = router["matchRoute"]("/about", "/about");

      expect(result).toEqual({ matched: true, params: {} });
    });

    it("should match route with params", () => {
      const result = router["matchRoute"]("/weather/:city", "/weather/moscow");

      expect(result).toEqual({ matched: true, params: { city: "moscow" } });
    });

    it("should match root route", () => {
      const result = router["matchRoute"]("/", "/");

      expect(result).toEqual({ matched: true, params: {} });
    });

    it("should not match when pattern length differs", () => {
      const result = router["matchRoute"](
        "/weather/:city",
        "/weather/moscow/extra",
      );

      expect(result).toEqual({ matched: false });
    });

    it("should not match when segments differ", () => {
      const result = router["matchRoute"]("/weather/:city", "/about/moscow");

      expect(result).toEqual({ matched: false });
    });

    it("should decode URI parameters", () => {
      const result = router["matchRoute"](
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
      router["currentRoute"] = {
        pattern: "/test",
        pathname: "/test",
        params: { city: "moscow" },
      };

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
      router["currentRoute"] = {
        pattern: "/test",
        pathname: "/test",
        params: {},
      };

      const path = router.getCurrentPath();

      expect(path).toBe("/test");
    });

    it("should return default path when no current route", () => {
      const path = router.getCurrentPath();

      expect(path).toBe("/");
    });
  });

  describe("getCurrentPattern", () => {
    it("should return current route pattern", () => {
      router["currentRoute"] = {
        pattern: "/weather/:city",
        pathname: "/weather/moscow",
        params: { city: "moscow" },
      };

      const pattern = router.getCurrentPattern();

      expect(pattern).toBe("/weather/:city");
    });

    it("should return null when no current route", () => {
      const pattern = router.getCurrentPattern();

      expect(pattern).toBeNull();
    });
  });

  describe("showError", () => {
    it("should emit weather:error event with error message", () => {
      const error = new Error("Test error");
      router["showError"](error);

      expect(bus.emit).toHaveBeenCalledWith("weather:error", "Test error");
    });

    it("should use default message when error has no message", () => {
      const error = {} as Error;
      router["showError"](error);

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

    it("should navigate using history API when useHashRouting is false", () => {
      router["useHashRouting"] = false;
      const pushStateSpy = jest
        .spyOn(window.history, "pushState")
        .mockImplementation();

      router.navigate("/test");

      expect(pushStateSpy).toHaveBeenCalledWith({}, "", "/test");
      pushStateSpy.mockRestore();
    });

    it("should navigate using history API with replace when useHashRouting is false", () => {
      router["useHashRouting"] = false;
      const replaceStateSpy = jest
        .spyOn(window.history, "replaceState")
        .mockImplementation();

      router.navigate("/test", { replace: true });

      expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/test");
      replaceStateSpy.mockRestore();
    });
  });

  describe("route", () => {
    it("should call matched route handler", async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      router.addRoute("/test", handler);

      await router.route("/test");

      expect(handler).toHaveBeenCalledWith("/test", {});
    });

    it("should pass params to route handler", async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      router.addRoute("/weather/:city", handler);

      await router.route("/weather/moscow");

      expect(handler).toHaveBeenCalledWith("/weather/moscow", {
        city: "moscow",
      });
    });

    it("should call notFoundHandler when route not found", async () => {
      const notFoundHandler = jest.fn().mockResolvedValue(undefined);
      router.setNotFoundHandler(notFoundHandler);

      await router.route("/non-existent");

      expect(notFoundHandler).toHaveBeenCalledWith("/non-existent");
    });

    it("should emit routeChanged event on successful route", async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      router.addRoute("/test", handler);

      await router.route("/test");

      expect(bus.emit).toHaveBeenCalledWith("router:routeChanged", {
        pathname: "/test",
        params: {},
      });
    });

    it("should not call handler when route is already active", async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      router.addRoute("/test", handler);
      router["currentRoute"] = {
        pattern: "/test",
        pathname: "/test",
        params: {},
      };

      await router.route("/test");

      expect(handler).not.toHaveBeenCalled();
    });

    it("should call showError when route handler throws error", async () => {
      const handler = jest.fn().mockRejectedValue(new Error("Route error"));
      const showErrorSpy = jest
        .spyOn(router as any, "showError")
        .mockImplementation();
      router.addRoute("/test", handler);

      await router.route("/test");

      expect(showErrorSpy).toHaveBeenCalled();
      showErrorSpy.mockRestore();
    });

    it("should call showError when notFoundHandler throws error", async () => {
      const notFoundHandler = jest
        .fn()
        .mockRejectedValue(new Error("404 error"));
      const showErrorSpy = jest
        .spyOn(router as any, "showError")
        .mockImplementation();
      router.setNotFoundHandler(notFoundHandler);

      await router.route("/non-existent");

      expect(showErrorSpy).toHaveBeenCalled();
      showErrorSpy.mockRestore();
    });
  });

  describe("handleHashChange", () => {
    it("should handle empty hash", () => {
      window.location.hash = "";
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue(undefined);

      router.handleHashChange();

      expect(routeSpy).toHaveBeenCalledWith("/");
      routeSpy.mockRestore();
    });

    it("should handle hash with path", () => {
      window.location.hash = "#!/weather/moscow";
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue(undefined);

      router.handleHashChange();

      expect(routeSpy).toHaveBeenCalledWith("/weather/moscow");
      routeSpy.mockRestore();
    });

    it("should handle hash with #! prefix", () => {
      window.location.hash = "#!/about";
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue(undefined);

      router.handleHashChange();

      expect(routeSpy).toHaveBeenCalledWith("/about");
      routeSpy.mockRestore();
    });

    it("should handle hash with simple # prefix", () => {
      window.location.hash = "#contact";
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue(undefined);

      router.handleHashChange();

      expect(routeSpy).toHaveBeenCalledWith("/contact");
      routeSpy.mockRestore();
    });
  });

  describe("handlePathChange", () => {
    it("should handle root path", () => {
      window.history.pushState({}, "", "/");
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue(undefined);

      router.handlePathChange();

      expect(routeSpy).toHaveBeenCalledWith("/");
      routeSpy.mockRestore();
    });

    it("should handle nested path", () => {
      window.history.pushState({}, "", "/weather/moscow");
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue(undefined);

      router.handlePathChange();

      expect(routeSpy).toHaveBeenCalledWith("/weather/moscow");
      routeSpy.mockRestore();
    });

    it("should handle path with trailing slash", () => {
      window.history.pushState({}, "", "/weather/moscow/");
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue(undefined);

      router.handlePathChange();

      expect(routeSpy).toHaveBeenCalledWith("/weather/moscow");
      routeSpy.mockRestore();
    });
  });

  describe("handleRouteChange", () => {
    it("should call handleHashChange when useHashRouting is true", () => {
      router["useHashRouting"] = true;
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue();

      router.handleRouteChange();

      expect(routeSpy).toHaveBeenCalled();
      routeSpy.mockRestore();
    });

    it("should call handlePathChange when useHashRouting is false", () => {
      router["useHashRouting"] = false;
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue();

      router.handleRouteChange();

      expect(routeSpy).toHaveBeenCalled();
      routeSpy.mockRestore();
    });
  });

  describe("handleInitialRoute", () => {
    it("should schedule route call when useHashRouting is true", async () => {
      router["useHashRouting"] = true;
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue();

      router.handleInitialRoute();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(routeSpy).toHaveBeenCalled();
      routeSpy.mockRestore();
    });

    it("should schedule route call when useHashRouting is false", async () => {
      router["useHashRouting"] = false;
      const routeSpy = jest.spyOn(router, "route").mockResolvedValue();

      router.handleInitialRoute();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(routeSpy).toHaveBeenCalled();
      routeSpy.mockRestore();
    });
  });

  describe("isActive", () => {
    it("should return true when current path matches exactly", () => {
      router["currentRoute"] = {
        pattern: "/about",
        pathname: "/about",
        params: {},
      };

      const result = router.isActive("/about", true);

      expect(result).toBe(true);
    });

    it("should return false when current path does not match exactly", () => {
      router["currentRoute"] = {
        pattern: "/about",
        pathname: "/about",
        params: {},
      };

      const result = router.isActive("/contact", true);

      expect(result).toBe(false);
    });

    it("should return true when current path starts with target path (non-exact)", () => {
      router["currentRoute"] = {
        pattern: "/weather/moscow",
        pathname: "/weather/moscow",
        params: { city: "moscow" },
      };

      const result = router.isActive("/weather", false);

      expect(result).toBe(true);
    });

    it("should return false when current path does not start with target path (non-exact)", () => {
      router["currentRoute"] = {
        pattern: "/about",
        pathname: "/about",
        params: {},
      };

      const result = router.isActive("/weather", false);

      expect(result).toBe(false);
    });

    it("should return true when both paths are root", () => {
      router["currentRoute"] = { pattern: "/", pathname: "/", params: {} };

      const result = router.isActive("/", false);

      expect(result).toBe(true);
    });
  });

  describe("click handler", () => {
    it("should navigate when clicking link with data-router-link", () => {
      const link = document.createElement("a");
      link.setAttribute("href", "/test");
      link.setAttribute("data-router-link", "");
      document.body.appendChild(link);

      const navigateSpy = jest.spyOn(router, "navigate").mockImplementation();

      link.click();

      expect(navigateSpy).toHaveBeenCalledWith("/test");
      navigateSpy.mockRestore();
    });

    it("should not navigate when clicking link with external URL", () => {
      const link = document.createElement("a");
      link.setAttribute("href", "http://example.com");
      link.setAttribute("data-router-link", "");
      document.body.appendChild(link);

      const navigateSpy = jest.spyOn(router, "navigate").mockImplementation();

      link.click();

      expect(navigateSpy).not.toHaveBeenCalled();
      navigateSpy.mockRestore();
    });
  });

  describe("popstate event listener", () => {
    it("should call handleRouteChange when popstate event fires", () => {
      router["useHashRouting"] = false;
      window.addEventListener = originalWindowAddEventListener;

      const handleRouteChangeSpy = jest
        .spyOn(router, "handleRouteChange")
        .mockImplementation();

      window.addEventListener("popstate", () => {
        router.handleRouteChange();
      });
      window.dispatchEvent(new Event("popstate"));

      expect(handleRouteChangeSpy).toHaveBeenCalled();
      handleRouteChangeSpy.mockRestore();
    });
  });
});
