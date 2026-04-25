class EventBus {
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
  on(event, callback, options = {}) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listener = {
      callback,
      once: options.once || false,
      context: options.context || null,
    };

    const listeners = this.events.get(event);
    listeners.push(listener);

    return () => this.off(event, callback);
  }

  /**
   * Подписка на событие с выполнением только один раз
   */
  once(event, callback, options = {}) {
    return this.on(event, callback, { ...options, once: true });
  }

  /**
   * Отписка от события
   * @param {string} event - Название события
   * @param {Function} callback - Функция-обработчик
   */
  off(event, callback) {
    if (!this.events.has(event)) return this;

    if (!callback) {
      this.events.delete(event);
      return this;
    }

    const listeners = this.events.get(event);
    const filtered = listeners.filter((l) => l.callback !== callback);

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
   * @param {...any} args - Аргументы для обработчиков
   */
  emit(event, ...args) {
    if (!this.events.has(event)) return false;

    const listeners = [...this.events.get(event)];
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
        .filter((listener) => !listener.once);

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
   * @param {...any} args - Аргументы для обработчиков
   * @returns {Promise<Array>} Promise с массивом результатов
   */
  async emitAsync(event, ...args) {
    if (!this.events.has(event)) return [];

    const listeners = [...this.events.get(event)];
    const results = [];
    let hasOnceListeners = false;

    for (const listener of listeners) {
      const context = listener.context || this;

      try {
        const result = await listener.callback.apply(context, args);
        results.push(result);

        if (listener.once) {
          hasOnceListeners = true;
        }
      } catch (error) {
        console.error(`Error in event ${event}:`, error);
        results.push(error);
      }
    }

    // Удаляем одноразовые обработчики
    if (hasOnceListeners) {
      const remaining = this.events
        .get(event)
        .filter((listener) => !listener.once);

      if (remaining.length === 0) {
        this.events.delete(event);
      } else {
        this.events.set(event, remaining);
      }
    }

    return results;
  }

  /**
   * Очистить все события
   */
  clear() {
    this.events.clear();
    return this;
  }
}

export const bus = new EventBus();
