import { bus } from './eventbus';

interface RouterOptions {
  useHashRouting?: boolean;
  containerId?: string;
}

interface RouteParams {
  [key: string]: string;
}

interface CurrentRoute {
  pattern: string;
  pathname: string;
  params: RouteParams;
}

class Router {
  private routes: Map<string, (pathname: string, params: RouteParams) => Promise<void>>;
  private notFoundHandler: ((pathname: string) => Promise<void>) | null;
  private currentRoute: CurrentRoute | null;
  private useHashRouting: boolean;
  private containerId: string;

  constructor(options: RouterOptions = {}) {
    this.routes = new Map();
    this.notFoundHandler = null;
    this.currentRoute = null;
    this.useHashRouting = options.useHashRouting !== false;
    this.containerId = options.containerId || 'main-container';

    this.init();
  }

  private init(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('[data-router-link]') as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        e.preventDefault();
        this.navigate(href);
      }
    });

    if (this.useHashRouting) {
      window.addEventListener('hashchange', () => this.handleRouteChange());
    } else {
      window.addEventListener('popstate', () => this.handleRouteChange());
    }

    this.handleInitialRoute();
  }

  public handleInitialRoute(): void {
    setTimeout(() => {
      this.handleRouteChange();
    }, 0);
  }

  public handlePathChange(): void {
    const pathname = window.location.pathname;
    const cleanPath = this.normalizePath(pathname);
    this.route(cleanPath);
  }

  public handleHashChange(): void {
    let hash = window.location.hash;
    let pathname = '/';
    
    if (hash && hash.startsWith('#!/')) {
      pathname = hash.slice(3);
    } else if (hash && hash.startsWith('#!')) {
      pathname = hash.slice(2);
    } else if (hash) {
      pathname = hash.slice(1);
    }
    
    const cleanPath = this.normalizePath(pathname);
    this.route(cleanPath);
  }

  public handleRouteChange(): void {
    if (this.useHashRouting) {
      this.handleHashChange();
    } else {
      this.handlePathChange();
    }
  }

  private normalizePath(path: string): string {
    let normalized = path.replace(/^\/+|\/+$/g, '');
    return normalized ? '/' + normalized : '/';
  }

  public navigate(path: string, options: { replace?: boolean } = {}): void {
    const cleanPath = this.normalizePath(path);
    const pathWithoutLeadingSlash = cleanPath.slice(1);

    if (this.useHashRouting) {
      const hashPath = pathWithoutLeadingSlash ? `#!/${pathWithoutLeadingSlash}` : '#!/';
      if (options.replace) {
        window.location.replace(`#${hashPath}`);
      } else {
        window.location.hash = hashPath;
      }
    } else {
      const url = cleanPath;
      if (options.replace) {
        window.history.replaceState({}, '', url);
      } else {
        window.history.pushState({}, '', url);
      }
      this.route(pathWithoutLeadingSlash || '/');
    }
  }

  public async route(pathname: string): Promise<void> {
    const normalizedPath = this.normalizePath(pathname);
    
    let matchedRoute = null;
    let params: RouteParams = {};
    let matchedPattern = '';

    for (const [routePattern, handler] of this.routes) {
      const result = this.matchRoute(routePattern, normalizedPath);
      if (result.matched) {
        matchedRoute = handler;
        params = result.params || {};
        matchedPattern = routePattern;
        break;
      }
    }

    if (matchedRoute) {
      if (this.currentRoute?.pathname === normalizedPath && this.currentRoute?.pattern === matchedPattern) {
        return;
      }

      this.currentRoute = {
        pattern: matchedPattern,
        pathname: normalizedPath,
        params,
      };

      try {
        await matchedRoute(normalizedPath, params);
        bus.emit('router:routeChanged', { pathname: normalizedPath, params });
      } catch (error) {
        console.error('Ошибка обработки роута:', error);
        this.showError(error);
      }
    } else if (this.notFoundHandler) {
      try {
        await this.notFoundHandler(normalizedPath);
      } catch (error) {
        console.error('Ошибка в обработчике 404:', error);
        this.showError(error);
      }
    } else {
      console.warn(`Роут не найден для пути: ${normalizedPath}`);
    }
  }

  private matchRoute(pattern: string, pathname: string): { matched: boolean; params?: RouteParams } {
    const normalizedPattern = pattern.replace(/^\/+|\/+$/g, '');
    const normalizedPathname = pathname.replace(/^\/+|\/+$/g, '');

    const patternParts = normalizedPattern.split('/').filter(Boolean);
    const pathParts = normalizedPathname.split('/').filter(Boolean);

    if (normalizedPattern === '' && normalizedPathname === '') {
      return { matched: true, params: {} };
    }

    if (patternParts.length !== pathParts.length) {
      return { matched: false };
    }

    const params: RouteParams = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      if (patternPart && patternPart.startsWith(':')) {
        const paramName = patternPart.slice(1);
        params[paramName] = decodeURIComponent(pathPart || "");
      } else if (patternPart !== pathPart) {
        return { matched: false };
      }
    }

    return { matched: true, params };
  }

  public addRoute(path: string, handler: (pathname: string, params: RouteParams) => Promise<void>): Router {
    this.routes.set(path, handler);
    return this;
  }

  public setNotFoundHandler(handler: (pathname: string) => Promise<void>): Router {
    this.notFoundHandler = handler;
    return this;
  }

  public getCurrentParams(): RouteParams {
    return this.currentRoute?.params || {};
  }

  public getCurrentPath(): string {
    return this.currentRoute?.pathname || '/';
  }

  public getCurrentPattern(): string | null {
    return this.currentRoute?.pattern || null;
  }

  private showError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Ошибка навигации';
    bus.emit('weather:error', message);
  }

  public goBack(): void {
    window.history.back();
  }

  public isActive(path: string, exact: boolean = false): boolean {
    const currentPath = this.getCurrentPath();
    const targetPath = this.normalizePath(path);
    
    if (exact) {
      return currentPath === targetPath;
    }
    
    return currentPath.startsWith(targetPath);
  }
}

export const router = new Router({ useHashRouting: true });