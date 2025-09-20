const GNEWS_API_KEY = '92014196812272a9a70602a07ef7f8d3';
let loggedInUser = null;
let chatbotOpen = false;

const categoryMap = {
  general: 'General',
  world: 'World',
  nation: 'Nation',
  business: 'Business',
  technology: 'Technology',
  entertainment: 'Entertainment',
  sports: 'Sports',
  science: 'Science',
  health: 'Health'
};

// Chatbot functionality
function toggleChatbot() {
  const container = document.getElementById('chatbot-container');
  const toggle = document.getElementById('chatbot-toggle');
  
  chatbotOpen = !chatbotOpen;
  
  if (chatbotOpen) {
    container.style.display = 'flex';
    toggle.style.display = 'none';
  } else {
    container.style.display = 'none';
    toggle.style.display = 'block';
  }
}

function handleChatKeyPress(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  const messagesContainer = document.getElementById('chatbot-messages');
  
  // Add user message
  addChatMessage(message, 'user');
  input.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  // Process the message and get response
  setTimeout(async () => {
    hideTypingIndicator();
    const response = await processChatMessage(message);
    addChatMessage(response, 'bot');
  }, 1000);
}

function addChatMessage(message, sender) {
  const messagesContainer = document.getElementById('chatbot-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  messageDiv.textContent = message;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('chatbot-messages');
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator';
  typingDiv.className = 'message bot-message typing-indicator';
  typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

async function processChatMessage(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm here to help you explore world news. You can ask me about specific topics, countries, or news categories like technology, sports, health, etc.";
  }
  
  // Check for help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "I can help you find news about:\n• Specific topics (e.g., 'climate change', 'AI', 'elections')\n• Countries or regions (e.g., 'India news', 'European news')\n• Categories (business, technology, sports, health, etc.)\n• Recent events or trending topics\n\nJust ask me what you're interested in!";
  }
  
  // Try to identify what the user is asking for
  let searchQuery = '';
  let category = '';
  
  // Check for category mentions
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerMessage.includes(key) || lowerMessage.includes(value.toLowerCase())) {
      category = key;
      break;
    }
  }
  
  // Extract search terms
  if (lowerMessage.includes('news about') || lowerMessage.includes('tell me about')) {
    searchQuery = message.replace(/.*?(news about|tell me about)\s*/i, '');
  } else if (lowerMessage.includes('latest') || lowerMessage.includes('recent')) {
    searchQuery = message.replace(/.*?(latest|recent)\s*/i, '');
  } else {
    searchQuery = message;
  }
  
  // Clean up the search query
  searchQuery = searchQuery.replace(/\b(news|latest|recent|tell me|about)\b/gi, '').trim();
  
  if (searchQuery || category) {
    try {
      const articles = await searchNewsForChatbot(searchQuery, category);
      if (articles && articles.length > 0) {
        const topArticles = articles.slice(0, 3);
        let response = `Here are some recent news articles${searchQuery ? ' about "' + searchQuery + '"' : ''}${category ? ' in ' + categoryMap[category] : ''}:\n\n`;
        
        topArticles.forEach((article, index) => {
          response += `${index + 1}. ${article.title}\n`;
          if (article.description) {
            response += `   ${article.description.substring(0, 100)}...\n`;
          }
          response += `   Read more: ${article.url}\n\n`;
        });
        
        return response;
      } else {
        return "I couldn't find any recent news articles for that query. Try searching for something else or check back later for updates!";
      }
    } catch (error) {
      console.error("Error processing chat message:", error);
      return "Sorry, I encountered an error while searching for news. Please try again later.";
    }
  }
  
  // Default response for unrecognized queries
  return "I'm not sure how to help with that. You can ask me about news topics, countries, or categories like technology, sports, or health. What would you like to know about?";
}

async function searchNewsForChatbot(query, category) {
  let url;
  if (category) {
    url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=in&max=10&apikey=${GNEWS_API_KEY}`;
  } else if (query) {
    url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=10&apikey=${GNEWS_API_KEY}`;
  } else {
    url = `https://gnews.io/api/v4/top-headlines?lang=en&country=in&max=10&apikey=${GNEWS_API_KEY}`;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching news:", error);
    return null;
  }
}

function showToast(message, type = 'success') {
  const toastEl = document.getElementById('toast-message');
  const toastBody = document.getElementById('toast-body');
  toastBody.innerText = message;
  toastEl.className = 'toast align-items-center text-white bg-' + type + ' border-0';
  new bootstrap.Toast(toastEl).show();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('show');
}

function toggleMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  body.classList.toggle('light-mode');
  const mode = body.classList.contains('dark-mode') ? 'dark' : 'light';
  document.getElementById('toggle-mode-btn').textContent = mode === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', mode);
}

function hideAllSections() {
  document.querySelectorAll('#main-section > div').forEach(div => div.style.display = 'none');
}

function displayUserInfo() {
  const name = loggedInUser?.name || 'Guest';
  document.getElementById('main-user-name').textContent = name;
  document.getElementById('sidebar-user-name').textContent = name;
  document.getElementById('avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d32f2f&color=fff`;
}

function showDashboard() {
  hideAllSections();
  document.getElementById('dashboard-section').style.display = 'block';
  displayUserInfo();
  loadNews(loggedInUser?.favoriteCategory || 'general');
}

function showSignIn() {
  hideAllSections();
  document.getElementById('sign-in-section').style.display = 'block';
}

function showSignUp() {
  hideAllSections();
  document.getElementById('sign-up-section').style.display = 'block';
}

function showBookmarks() {
  hideAllSections();
  document.getElementById('bookmarks-section').style.display = 'block';
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  renderArticles(bookmarks, 'bookmarks-container');
}

function showAbout() {
  hideAllSections();
  document.getElementById('about-section').style.display = 'block';
}

function loadNews(category = 'general') {
  fetch(`https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=in&max=10&apikey=${GNEWS_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      localStorage.setItem('latestArticles', JSON.stringify(data.articles || []));
      renderArticles(data.articles || [], 'news-container');
    });
}

function renderArticles(articles, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  articles.forEach((a, i) => {
    const isBookmarked = bookmarks.some(b => b.url === a.url);
    container.innerHTML += `
      <div class="col-md-4">
        <div class="card news-card">
          <img src="${a.image || 'https://via.placeholder.com/300x200'}" class="card-img-top news-image" alt="News" />
          <div class="card-body">
            <h5 class="card-title">${a.title}</h5>
            <p class="card-text">${a.description || ''}</p>
            <a href="${a.url}" target="_blank" class="btn btn-sm btn-outline-primary">Read More</a>
            <button class="btn btn-sm btn-outline-primary float-end" onclick="toggleBookmark(${i})">
              ${isBookmarked ? '✅ Bookmarked' : '📖 Bookmark'}
            </button>
          </div>
        </div>
      </div>`;
  });
}

function toggleBookmark(index) {
  if (!loggedInUser) return showToast('Sign in to bookmark', 'warning');
  const articles = JSON.parse(localStorage.getItem('latestArticles') || '[]');
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  const article = articles[index];
  if (!article) return;

  const exists = bookmarks.find(a => a.url === article.url);
  if (exists) {
    const updated = bookmarks.filter(a => a.url !== article.url);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
    showToast('Bookmark removed!', 'info');
  } else {
    bookmarks.push(article);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    showToast('Bookmarked!', 'success');
  }
  renderArticles(articles, 'news-container');
}

// Form event listeners
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('sign-up-form').onsubmit = e => {
    e.preventDefault();
    const name = document.getElementById('sign-up-name').value.trim();
    const email = document.getElementById('sign-up-email').value.trim();
    const password = document.getElementById('sign-up-password').value;
    const user = { name, email, password, favoriteCategory: 'general' };
    localStorage.setItem('user', JSON.stringify(user));
    loggedInUser = user;
    localStorage.setItem('user_data', JSON.stringify(loggedInUser));
    showToast('Account created. Signed in!');
    showDashboard();
  };

  document.getElementById('sign-in-form').onsubmit = e => {
    e.preventDefault();
    const email = document.getElementById('sign-in-email').value.trim();
    const password = document.getElementById('sign-in-password').value;
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    if (stored.email === email && stored.password === password) {
      loggedInUser = stored;
      localStorage.setItem('user_data', JSON.stringify(loggedInUser));
      showToast('Signed in successfully!');
      showDashboard();
    } else {
      showToast('Invalid credentials', 'danger');
    }
  };
});

function logout() {
  loggedInUser = null;
  localStorage.removeItem('user_data');
  showToast('Logged out!');
  showDashboard();
}

function searchNews() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;
  fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=10&apikey=${GNEWS_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      localStorage.setItem('latestArticles', JSON.stringify(data.articles || []));
      renderArticles(data.articles || [], 'news-container');
    });
}

// Initialize
window.onload = () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.classList.add(savedTheme + '-mode');
  document.getElementById('toggle-mode-btn').textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  loggedInUser = JSON.parse(localStorage.getItem('user_data') || 'null');
  showDashboard();
};