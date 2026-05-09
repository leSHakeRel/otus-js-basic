import "./aboutView.css";

/**
 * Рендер страницы "О приложении"
 * @param container - контейнер для рендера
 */
export function renderAbout(container: HTMLElement): void {
  container.innerHTML = "";
  const aboutDiv = document.createElement("div");
  aboutDiv.className = "about-container";
  aboutDiv.innerHTML = `
    <div class="about-content">
      <h2>О приложении "Прогноз погоды"</h2>
      
      <div class="about-section">
        <p>Приложение для просмотра прогноза погоды</p>
      </div>

      <div class="about-section">
        <h3>Технологии</h3>
        <ul>
          <li>Vanilla JavaScript (ES6+)</li>
          <li>Клиентский роутинг с поддержкой истории</li>
          <li>Event-driven архитектура (EventBus)</li>
          <li>Open-Meteo API для данных о погоде</li>
          <li>IP-API для геолокации</li>
        </ul>
      </div>

      <div class="about-section">
        <h3>Ссылки</h3>
        <ul>
          <li><a href="https://open-meteo.com/" target="_blank">Open-Meteo API</a></li>
          <li><a href="https://ip-api.com/" target="_blank">IP-API</a></li>
        </ul>
      </div>

      <button class="back-to-home" data-router-link="href" href="/main">Вернуться на главную</button>
    </div>
  `;

  container.appendChild(aboutDiv);
}
