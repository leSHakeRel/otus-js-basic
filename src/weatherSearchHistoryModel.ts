import { weatherStorage } from "./weatherStorageService";

type Observer = ObserverFunction | ObserverObject;

interface ObserverFunction {
  (history: string[]): void;
}

interface ObserverObject {
  onHistoryChanged: (history: string[]) => void;
}

class WeatherSearchHistoryModel {
  private history: string[];
  private observers: Observer[];

  constructor() {
    this.history = [];
    this.observers = [];
    this.loadHistory();
  }

  private loadHistory(): void {
    this.history = weatherStorage.getSearchHistory();
    this.notifyObservers();
  }

  public getHistory(): string[] {
    return [...this.history];
  }

  public getLastCity(): string | null {
    return this.history.length > 0 ? (this.history[0] ?? null) : null;
  }

  public isEmpty(): boolean {
    return this.history.length === 0;
  }

  public getCount(): number {
    return this.history.length;
  }

  public addCity(cityName: string): void {
    const filtered = this.history.filter((city) => city !== cityName);
    filtered.unshift(cityName);
    this.history = filtered.slice(0, 10);
    this.saveToStorage();
  }

  public clearHistory(): void {
    this.history = [];
    this.saveToStorage();
  }

  public removeCity(cityName: string): void {
    this.history = this.history.filter((city) => city !== cityName);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    weatherStorage.saveSearchHistory(this.history);
    this.notifyObservers();
  }

  public addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  public removeObserver(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  private notifyObservers(): void {
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
