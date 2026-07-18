/* ==========================================================================
   MODULE 1: TASK STATE MANAGER
   ========================================================================== */
let todos = JSON.parse(localStorage.getItem('portfolio-todos')) || [
    { id: 1, text: "Build semantic portfolio layout", completed: true },
    { id: 2, text: "Implement fluid responsive CSS Grid styles", completed: true },
    { id: 3, text: "Master dynamic DOM manipulation with JavaScript", completed: true }
];
let currentFilter = 'all';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-btn');

function saveToLocalStorage() {
    localStorage.setItem('portfolio-todos', JSON.stringify(todos));
}

function renderTodos() {
    if (!todoList) return;
    todoList.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<li class="empty-state">No tasks found.</li>`;
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        li.innerHTML = `
      <div class="todo-item-left">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} aria-label="Toggle status">
        <span class="todo-text" contenteditable="true">${todo.text}</span>
      </div>
      <button class="delete-btn" aria-label="Delete">&times;</button>
    `;
        todoList.appendChild(li);
    });
}

if (todoForm) {
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (!text) return;
        todos.push({ id: Date.now(), text, completed: false });
        saveToLocalStorage();
        renderTodos();
        todoInput.value = '';
    });
}

if (todoList) {
    todoList.addEventListener('click', (e) => {
        const li = e.target.closest('.todo-item');
        if (!li) return;
        const id = Number(li.dataset.id);
        if (e.target.type === 'checkbox') {
            todos = todos.map(t => t.id === id ? { ...t, completed: e.target.checked } : t);
            saveToLocalStorage();
            renderTodos();
        }
        if (e.target.classList.contains('delete-btn')) {
            todos = todos.filter(t => t.id !== id);
            saveToLocalStorage();
            renderTodos();
        }
    });
}

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

/* ==========================================================================
   MODULE 2: BULLETPROOF ASYNCHRONOUS WEATHER DASHBOARD
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const weatherForm = document.getElementById('weather-form');
    const weatherInput = document.getElementById('weather-input');
    const weatherCard = document.getElementById('weather-result-card');

    if (weatherForm) {
        weatherForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const cityName = weatherInput.value.trim();
            if (!cityName) return;

            // Immediately show visual loading status feedback
            weatherCard.innerHTML = `<div class="weather-loading">Searching networks for "${cityName}" updates...</div>`;
            weatherCard.classList.add('active');

            try {
                // Step A: Convert city string to geographic coordinates safely
                const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
                const geoResponse = await fetch(geoUrl);

                if (!geoResponse.ok) throw new Error("Could not connect to the location network server.");

                const geoData = await geoResponse.json();

                if (!geoData.results || geoData.results.length === 0) {
                    throw new Error(`Location "${cityName}" not found. Try checking your spelling.`);
                }

                const { latitude, longitude, name, country } = geoData.results[0];

                // Step B: Request live current telemetry matrices from the weather API engine
                const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
                const weatherResponse = await fetch(weatherUrl);

                if (!weatherResponse.ok) throw new Error("Could not retrieve weather telemetry matrices.");

                const weatherData = await weatherResponse.json();
                const current = weatherData.current;

                // Step C: Resolve code variants to plain language statements
                let conditionText = "Clear Skies";
                if (current.weather_code > 0 && current.weather_code <= 3) conditionText = "Partly Cloudy";
                else if (current.weather_code >= 45 && current.weather_code <= 48) conditionText = "Foggy Weather";
                else if (current.weather_code >= 51 && current.weather_code <= 67) conditionText = "Drizzle / Light Rain";
                else if (current.weather_code >= 71 && current.weather_code <= 77) conditionText = "Snowfall Cycles";
                else if (current.weather_code >= 80) conditionText = "Storm / Rain Showers";

                // Step D: Directly compile visual elements onto application viewport card panels
                weatherCard.innerHTML = `
          <div class="weather-display-header">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-color);">${name}, ${country}</h3>
            <span class="weather-status-tag">${conditionText}</span>
          </div>
          <div class="weather-metrics-grid" style="margin-top: 1rem;">
            <div class="metric-block">
              <span class="metric-label">Temperature</span>
              <span class="metric-value">${Math.round(current.temperature_2m)}°C</span>
            </div>
            <div class="metric-block">
              <span class="metric-label">Humidity</span>
              <span class="metric-value">${current.relative_humidity_2m}%</span>
            </div>
            <div class="metric-block">
              <span class="metric-label">Wind Speed</span>
              <span class="metric-value">${current.wind_speed_10m} km/h</span>
            </div>
          </div>
        `;

            } catch (error) {
                // Step E: Gracefully display any errors found during calculation runs
                weatherCard.innerHTML = `
          <div class="weather-error-container">
            <span class="error-icon">⚠️</span>
            <p class="error-message" style="margin: 0;">${error.message}</p>
          </div>
        `;
            }
        });
    }
});

// Run task framework boot sequence
renderTodos();