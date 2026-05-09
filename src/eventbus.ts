interface EventListener {
  callback: Function;
  once: boolean;
  context: unknown | null;
}

class EventBus {
  private events: Map<string, EventListener[]>;

  constructor() {
    this.events = new Map();
  }

  /**
   * Подписка на событие
   * @param {string} event - Название события
   * @param {Function} callback - Функция-обработчик
   * @param {Object} options - Дополнительные опции
   * @param {boolean} options.once - Выполнить только один раз
   * @param {Object} options.context - Контекст функции обработчика
   * @returns {Function} Функция для отписки
   */
  on(event: string, callback: Function, options: { once?: boolean; context?: any } = {}): () => void {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listener: EventListener = {
      callback,
      once: options.once || false,
      context: options.context || null,
    };

    const listeners = this.events.get(event);
    listeners?.push(listener);

    return () => this.off(event, callback);
  }

  /**
   * Подписка на событие с выполнением только один раз
   */
  once(event: string, callback: Function, options: { context?: unknown } = {}): () => void {
    return this.on(event, callback, { ...options, once: true });
  }

  /**
   * Отписка от события
   * @param {string} event - Название события
   * @param {Function} callback - Функция-обработчик
   */
  off(event: string, callback?: Function): this {
    if (!this.events.has(event)) return this;

    if (!callback) {
      this.events.delete(event);
      return this;
    }

    const listeners = this.events.get(event);
    const filtered = listeners?.filter((l) => l.callback !== callback) || [];

    if (filtered.length === 0) {
      this.events.delete(event);
    } else {
      this.events.set(event, filtered);
    }

    return this;
  }

  /**
   * Вызов события
   * @param {string} event - Название события
   * @param {...unknown} args - Аргументы для обработчиков
   */
  emit(event: string, ...args: unknown[]): boolean {
    if (!this.events.has(event)) return false;

    const listeners = [...(this.events.get(event) || [])];
    let hasOnceListeners = false;

    for (const listener of listeners) {
      const context = listener.context || this;
      const result = listener.callback.apply(context, args);

      if (listener.once) {
        hasOnceListeners = true;
      }
    }

    if (hasOnceListeners) {
      const remaining = this.events
        .get(event)
        ?.filter((listener) => !listener.once) || [];

      if (remaining.length === 0) {
        this.events.delete(event);
      } else {
        this.events.set(event, remaining);
      }
    }

    return true;
  }

  /**
   * Асинхронный вызов события
   * @param {string} event - Название события
   * @param {...unknown} args - Аргументы для обработчиков
   */
  async emitAsync(event: string, ...args: unknown[]): Promise<void> {
    if (!this.events.has(event)) return;

    const listeners = [...(this.events.get(event) || [])];
    let hasOnceListeners = false;

    for (const listener of listeners) {
      const context = listener.context || this;

      try {
        await listener.callback.apply(context, args);

        if (listener.once) {
          hasOnceListeners = true;
        }
      } catch (error) {
        console.error(`Error in event ${event}:`, error);
      }
    }

    // Удаляем одноразовые обработчики
    if (hasOnceListeners) {
      const remaining = this.events
        .get(event)
        ?.filter((listener) => !listener.once) || [];

      if (remaining.length === 0) {
        this.events.delete(event);
      } else {
        this.events.set(event, remaining);
      }
    }
  }

  /**
   * Очистить все события
   */
  clear(): this {
    this.events.clear();
    return this;
  }
}

export const bus = new EventBus();
