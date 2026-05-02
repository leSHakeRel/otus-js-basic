// router.js - исправленная версия
import { bus } from "./eventbus.js";

class Router {
  constructor(options = {}) {
    this.routes = new Map();
    this.notFoundHandler = null;
    this.currentRoute = null;
    this.useHashRouting = options.useHashRouting !== false;
    this.containerId = options.containerId || "main-container";

    this.init();
  }

  init() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-router-link]");
      if (!link) return;

      e.preventDefault();
      const href = link.getAttribute("href");
      this.navigate(href);
    });

    if (this.useHashRouting) {
      window.addEventListener("hashchange", () => this.handleRouteChange());
    } else {
      window.addEventListener("popstate", () => this.handleRouteChange());
    }

    this.handleInitialRoute();
  }

  handleInitialRoute() {
    if (this.useHashRouting) {
      this.handleHashChange();
    } else {
      this.handlePathChange();
    }
  }

  handlePathChange() {
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, "") || "/";
    this.route(pathname);
  }

  handleHashChange() {
    let pathname = window.location.hash.slice(2);
    pathname = pathname.replace(/^\/+|\/+$/g, "") || "/";
    this.route(pathname);
  }

  handleRouteChange() {
    if (this.useHashRouting) {
      this.handleHashChange();
    } else {
      this.handlePathChange();
    }
  }

  navigate(path, options = {}) {
    // Убираем ведущие и завершающие слеши из пути
    let cleanPath = path.replace(/^\/+|\/+$/g, "");

    if (this.useHashRouting) {
      // Если путь не пустой, добавляем его, иначе просто хэш
      window.location.hash = cleanPath ? `#!/${cleanPath}` : "#!/";
    } else {
      const url = cleanPath ? `/${cleanPath}` : "/";
      if (options.replace) {
        window.history.replaceState({}, "", url);
      } else {
        window.history.pushState({}, "", url);
      }
      this.route(cleanPath);
    }
  }

  async route(pathname) {
    // Сохраняем ведущий слеш для корневого пути
    let normalizedPath = pathname;

    // Если путь не пустой и не начинается со слеша, добавляем его
    if (
      normalizedPath &&
      !normalizedPath.startsWith("/") &&
      normalizedPath !== "/"
    ) {
      normalizedPath = "/" + normalizedPath;
    }

    // Убираем завершающие слеши
    normalizedPath = normalizedPath.replace(/\/+$/, "");

    // let normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
    normalizedPath = normalizedPath || "/";

    let matchedRoute = null;
    let params = {};

    for (const [routePattern, handler] of this.routes) {
      const result = this.matchRoute(routePattern, normalizedPath);
      if (result.matched) {
        matchedRoute = handler;
        params = result.params;
        this.currentRoute = {
          pattern: routePattern,
          pathname: normalizedPath,
          params,
        };
        break;
      }
    }

    if (matchedRoute) {
      try {
        await matchedRoute(normalizedPath, params);
        bus.emit("router:routeChanged", { pathname: normalizedPath, params });
      } catch (error) {
        console.error("Ошибка обработки роута:", error);
        this.showError(error);
      }
    } else if (this.notFoundHandler) {
      await this.notFoundHandler(normalizedPath);
    } else {
      console.warn(`Роут не найден для пути: ${normalizedPath}`);
    }
  }

  matchRoute(pattern, pathname) {
    const normalizedPattern = pattern.replace(/^\/+|\/+$/g, "");
    const normalizedPathname = pathname.replace(/^\/+|\/+$/g, "");

    const patternParts = normalizedPattern.split("/").filter(Boolean);
    const pathParts = normalizedPathname.split("/").filter(Boolean);

    if (normalizedPattern === "" && normalizedPathname === "") {
      return { matched: true, params: {} };
    }

    if (patternParts.length !== pathParts.length) {
      return { matched: false };
    }

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return { matched: false };
      }
    }

    return { matched: true, params };
  }

  addRoute(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  setNotFoundHandler(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  getCurrentParams() {
    return this.currentRoute?.params || {};
  }

  getCurrentPath() {
    return this.currentRoute?.pathname || "/";
  }

  showError(error) {
    bus.emit("weather:error", error.message || "Ошибка навигации");
  }

  goBack() {
    window.history.back();
  }
}

export const router = new Router({ useHashRouting: true });
