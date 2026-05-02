// weatherSearchHistoryModel.js
import { weatherStorage } from "./weatherStorageService.js";

class WeatherSearchHistoryModel {
  constructor() {
    this.history = [];
    this.observers = [];
    this.loadHistory();
  }

  // Загрузка истории из storage
  loadHistory() {
    this.history = weatherStorage.getSearchHistory();
    this.notifyObservers();
  }

  // Получить всю историю
  getHistory() {
    return [...this.history];
  }

  // Получить последний город
  getLastCity() {
    return this.history.length > 0 ? this.history[0] : null;
  }

  // Проверить, пуста ли история
  isEmpty() {
    return this.history.length === 0;
  }

  // Получить количество городов в истории
  getCount() {
    return this.history.length;
  }

  // Добавить город в историю
  addCity(cityName) {
    const filtered = this.history.filter((city) => city !== cityName);
    filtered.unshift(cityName);
    this.history = filtered.slice(0, 10);
    this.saveToStorage();
  }

  // Очистить всю историю
  clearHistory() {
    this.history = [];
    this.saveToStorage();
  }

  // Удалить конкретный город
  removeCity(cityName) {
    this.history = this.history.filter((city) => city !== cityName);
    this.saveToStorage();
  }

  // Сохранить в storage и уведомить наблюдателей
  saveToStorage() {
    weatherStorage.saveSearchHistory(this.history);
    this.notifyObservers();
  }

  // Добавить наблюдателя
  addObserver(observer) {
    this.observers.push(observer);
  }

  // Удалить наблюдателя
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  // Уведомить всех наблюдателей
  notifyObservers() {
    this.observers.forEach((observer) => {
      if (typeof observer === "function") {
        observer(this.getHistory());
      } else if (observer.onHistoryChanged) {
        observer.onHistoryChanged(this.getHistory());
      }
    });
  }
}

export const historyModel = new WeatherSearchHistoryModel();
