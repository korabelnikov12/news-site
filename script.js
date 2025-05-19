document.addEventListener('DOMContentLoaded', function() {
    const AUTHOR_CODE = "NEWS2025";
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let articles = JSON.parse(localStorage.getItem('articles')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];

    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    const authLink = document.getElementById('auth-link');
    const createLink = document.getElementById('create-link');
    const logoutLink = document.getElementById('logout-link');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const articleForm = document.getElementById('article-form');
    const articlesContainer = document.getElementById('articles-container');
    const authTabs = document.querySelectorAll('.tab-btn');
    const authContents = document.querySelectorAll('.auth-content');
    const userRoleSelect = document.getElementById('user-role');
    const authorCodeField = document.getElementById('author-code-field');
    const modal = document.getElementById('article-modal');
    const closeBtn = document.querySelector('.close-btn');

    function saveData() {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('articles', JSON.stringify(articles));
        localStorage.setItem('users', JSON.stringify(users));
    }

    function initArticles() {
        articlesContainer.innerHTML = '';
        articles.forEach(article => {
            createArticleCard(article);
        });
    }

    function createArticleCard(article) {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        articleCard.dataset.id = article.id;
        
        articleCard.innerHTML = `
            <div class="article-card__header">
                <p class="article-card__category">${article.category}</p>
                <p class="article-card__time">${article.date} • ${article.author}</p>
            </div>
            <div class="article-card__body">
                <h3 class="article-card__title">${article.title}</h3>
                <p class="article-card__text">${article.text}</p>
            </div>
        `;
        
        articleCard.addEventListener('click', () => showArticleModal(article));
        articlesContainer.appendChild(articleCard);
    }

    function showArticleModal(article) {
        document.getElementById('modal-title').textContent = article.title;
        document.getElementById('modal-category').textContent = article.category;
        document.getElementById('modal-date').textContent = article.date;
        document.getElementById('modal-author').textContent = article.author;
        document.getElementById('modal-text').textContent = article.text;
        modal.style.display = 'block';
    }

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });

    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            authTabs.forEach(t => t.classList.remove('active'));
            authContents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(`${type}-form`).classList.add('active');
        });
    });

    userRoleSelect.addEventListener('change', function() {
        authorCodeField.style.display = this.value === 'author' ? 'block' : 'none';
    });

    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        currentUser = null;
        updateAuthState();
        showPage('home');
        saveData();
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const login = this.querySelector('input[type="text"]').value;
        const password = this.querySelector('input[type="password"]').value;
        const user = users.find(u => u.login === login && u.password === password);
        
        if (user) {
            currentUser = {
                login: user.login,
                role: user.role
            };
            updateAuthState();
            showPage('home');
            this.reset();
            saveData();
        } else {
            alert('Неверный логин или пароль');
        }
    });

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const login = this.querySelector('input[type="text"]').value.trim();
        const password = this.querySelector('input[type="password"]').value.trim();
        const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value.trim();
        const role = userRoleSelect.value;
        const authorCode = document.getElementById('author-code').value.trim();
        
        if (!login || !password || !confirmPassword) {
            alert('Все поля обязательны для заполнения');
            return;
        }

        if (password !== confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }
        
        if (role === 'author' && authorCode !== AUTHOR_CODE) {
            alert('Неверный код автора!');
            return;
        }
        
        if (users.some(u => u.login === login)) {
            alert('Пользователь с таким логином уже существует');
            return;
        }
        
        users.push({ login, password, role });
        currentUser = { login, role };
        
        updateAuthState();
        showPage('home');
        this.reset();
        authorCodeField.style.display = 'none';
        userRoleSelect.value = 'reader';
        authTabs[0].click();
        saveData();
    });

    articleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!currentUser || currentUser.role !== 'author') return;
        
        const title = this.querySelector('input[type="text"]').value;
        const category = this.querySelector('select').value;
        const text = this.querySelector('textarea').value;
        
        const newArticle = {
            id: articles.length + 1,
            title,
            category,
            text,
            author: currentUser.login,
            date: new Date().toLocaleDateString()
        };
        
        articles.unshift(newArticle);
        createArticleCard(newArticle);
        this.reset();
        showPage('home');
        saveData();
    });

    function updateAuthState() {
        if (currentUser) {
            authLink.style.display = 'none';
            logoutLink.style.display = 'block';
            createLink.style.display = currentUser.role === 'author' ? 'block' : 'none';
        } else {
            authLink.style.display = 'block';
            logoutLink.style.display = 'none';
            createLink.style.display = 'none';
        }
    }

    function showPage(pageId) {
        pages.forEach(page => page.style.display = 'none');
        if (pageId) document.getElementById(`${pageId}-page`).style.display = 'block';
        navLinks.forEach(lnk => lnk.classList.remove('active'));
        if (pageId) document.querySelector(`.nav-link[data-page="${pageId}"]`)?.classList.add('active');
    }

    if (articles.length === 0) {
        articles = [
            {
                id: 1,
                title: 'Как изменится климат России в ближайшие 10 лет',
                category: 'Экология',
                text: 'Прогноз ученых о климатических изменениях...',
                author: 'Иван Петров',
                date: '16.05.2024'
            },
            {
                id: 2,
                title: 'Новые технологии в энергетике',
                category: 'Наука',
                text: 'Российские ученые представили революционную технологию...',
                author: 'Анна Сидорова',
                date: '15.05.2024'
            }
        ];
        saveData();
    }

    updateAuthState();
    showPage('home');
    initArticles();
});