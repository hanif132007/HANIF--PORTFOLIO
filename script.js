let todos = JSON.parse(localStorage.getItem('portfolio-todos')) || [
    { id: 1, text: "Build semantic portfolio layout", completed: true },
    { id: 2, text: "Implement fluid responsive CSS Grid styles", completed: true },
    { id: 3, text: "Master dynamic DOM manipulation with JavaScript", completed: false }
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
    todoList.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // 'all'
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<li class="empty-state">No tasks found in this view.</li>`;
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
      <div class="todo-item-left">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} aria-label="Toggle task status">
        <span class="todo-text" contenteditable="true" title="Click to edit text">${todo.text}</span>
      </div>
      <button class="delete-btn" aria-label="Delete task">&times;</button>
    `;

        todoList.appendChild(li);
    });
}

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(newTodo);
    saveToLocalStorage();
    renderTodos();
    todoInput.value = '';
    todoInput.focus();
});

todoList.addEventListener('click', (e) => {
    const li = e.target.closest('.todo-item');
    if (!li) return;
    const id = Number(li.dataset.id);

    if (e.target.type === 'checkbox') {
        todos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: e.target.checked } : todo
        );
        saveToLocalStorage();
        renderTodos();
    }

    if (e.target.classList.contains('delete-btn')) {
        todos = todos.filter(todo => todo.id !== id);
        saveToLocalStorage();
        renderTodos();
    }
});

todoList.addEventListener('blur', (e) => {
    if (e.target.classList.contains('todo-text')) {
        const li = e.target.closest('.todo-item');
        const id = Number(li.dataset.id);
        const updatedText = e.target.innerText.trim();

        if (updatedText) {
            todos = todos.map(todo =>
                todo.id === id ? { ...todo, text: updatedText } : todo
            );
            saveToLocalStorage();
        } else {
            renderTodos(); // Revert back if left completely blank
        }
    }
}, true);
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

renderTodos();