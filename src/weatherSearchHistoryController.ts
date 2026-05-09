// weatherSearchHistoryController.ts
import { historyModel } from "./weatherSearchHistoryModel";
import { historyView } from "./weatherSearchHistoryView";

interface HistoryController {
  getHistory(): string[];
  clearHistory(): void;
  removeCity(cityName: string): void;
  addCity(cityName: string): void;
  getLastCity(): string | null;
  isEmpty(): boolean;
}

class WeatherSearchHistoryController implements HistoryController {
  private view: typeof historyView;
  private model: typeof historyModel;

  constructor() {
    this.view = historyView;
    this.model = historyModel;

    this.model.addObserver(this.onHistoryChanged.bind(this));
  }

  /**
   * Инициализация контроллера
   * @param container - заполнение контейнера виджетом истории поиска
   */
  init(container: HTMLElement): void {
    this.view.render(container, this);
  }

  /**
   * Обработчик изменения истории
   * @param history - массив городов
   */
  private onHistoryChanged(history: string[]): void {
    this.view.update(history);
  }

  /**
   * Добавить город в историю
   * @param cityName - название города
   */
  public addCity(cityName: string): void {
    if (cityName && cityName.trim()) {
      this.model.addCity(cityName.trim());
    }
  }

  /**
   * Очистить всю историю
   */
  public clearHistory(): void {
    if (confirm("Вы уверены, что хотите очистить всю историю поиска?")) {
      this.model.clearHistory();
    }
  }

  /**
   * Удалить конкретный город
   * @param cityName - название города
   */
  public removeCity(cityName: string): void {
    if (confirm(`Удалить "${cityName}" из истории поиска?`)) {
      this.model.removeCity(cityName);
    }
  }

  /**
   * Получить историю
   * @returns массив истории поиска
   */
  public getHistory(): string[] {
    return this.model.getHistory();
  }

  /**
   * Получить последний город из истории
   * @returns string | null
   */
  public getLastCity(): string | null {
    return this.model.getLastCity();
  }

  /**
   * Проверить, пуста ли история
   * @returns boolean
   */
  public isEmpty(): boolean {
    return this.model.isEmpty();
  }
}

export const historyController = new WeatherSearchHistoryController();
