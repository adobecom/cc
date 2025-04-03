class AIAssistant {
  constructor(el) {
    this.el = el;
    this.data = null;
    this.currentScreen = 'features';
    this.selectedFeature = null;
    this.userSelections = {};
    this.init();
  }

  async init() {
    try {
      await this.fetchData();
      this.renderScreen();
    } catch (error) {
      console.error('Error initializing AI Assistant:', error);
    }
  }

  async fetchData() {
    try {
      const response = await fetch('/creativecloud/blocks/ai-assistant/ai-assistant.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
    } catch (error) {
      console.error('Error fetching AI Assistant data:', error);
      throw error;
    }
  }

  renderScreen() {
    this.el.innerHTML = '';
    
    // Add navigation if not on features screen
    if (this.currentScreen !== 'features') {
      this.renderNavigation();
    }

    switch (this.currentScreen) {
      case 'features':
        this.renderFeatures();
        break;
      case 'options':
        this.renderOptions();
        break;
      case 'chat':
        this.renderChat();
        break;
    }
  }

  renderNavigation() {
    const nav = document.createElement('div');
    nav.className = 'ai-assistant__nav';

    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'ai-assistant__nav-back';
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => this.goBack());

    // Breadcrumb
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'ai-assistant__breadcrumb';
    
    const breadcrumbItems = [
      { text: 'Features', screen: 'features' },
      { text: this.getFeatureTitle(), screen: 'options' }
    ];

    if (this.currentScreen === 'chat') {
      breadcrumbItems.push({ text: 'Chat', screen: 'chat' });
    }

    breadcrumb.innerHTML = breadcrumbItems.map(item => `
      <div class="ai-assistant__breadcrumb-item">${item.text}</div>
    `).join('');

    nav.appendChild(backButton);
    nav.appendChild(breadcrumb);
    this.el.appendChild(nav);
  }

  getFeatureTitle() {
    if (!this.selectedFeature || !this.data.features) return '';
    const feature = this.data.features.find(f => f.id === this.selectedFeature);
    return feature ? feature.title : '';
  }

  goBack() {
    switch (this.currentScreen) {
      case 'chat':
        this.currentScreen = 'options';
        break;
      case 'options':
        this.currentScreen = 'features';
        this.selectedFeature = null;
        this.userSelections = {};
        break;
    }
    this.renderScreen();
  }

  renderFeatures() {
    const container = document.createElement('div');
    container.className = 'ai-assistant__features';
    
    this.data.features.forEach(feature => {
      const card = document.createElement('div');
      card.className = 'ai-assistant__feature-card';
      card.innerHTML = `
        <div class="ai-assistant__feature-icon">
          <img src="${feature.icon}" alt="${feature.title} icon">
        </div>
        <div class="ai-assistant__feature-image">
          <img src="${feature.imageUrl}" alt="${feature.title}">
        </div>
        <div class="ai-assistant__feature-content">
          <h3>${feature.title}</h3>
          <p>${feature.description}</p>
        </div>
      `;
      
      card.addEventListener('click', () => this.selectFeature(feature.id));
      container.appendChild(card);
    });

    this.el.appendChild(container);
  }

  renderOptions() {
    if (!this.selectedFeature || !this.data.options[this.selectedFeature]) return;

    const container = document.createElement('div');
    container.className = 'ai-assistant__options';
    
    const options = this.data.options[this.selectedFeature];
    container.innerHTML = `<h2>${options.title}</h2>`;

    const form = document.createElement('form');
    form.className = 'ai-assistant__form';

    options.fields.forEach(field => {
      const fieldContainer = document.createElement('div');
      fieldContainer.className = 'ai-assistant__field';

      switch (field.type) {
        case 'select':
          fieldContainer.innerHTML = `
            <label for="${field.id}">${field.label}</label>
            <select id="${field.id}" ${field.required ? 'required' : ''}>
              <option value="">Select an option...</option>
              ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
          `;
          break;

        case 'textarea':
          fieldContainer.innerHTML = `
            <label for="${field.id}">${field.label}</label>
            <textarea id="${field.id}" 
                      placeholder="${field.placeholder || ''}"
                      ${field.required ? 'required' : ''}></textarea>
          `;
          break;

        case 'checkbox':
          fieldContainer.innerHTML = `
            <label>${field.label}</label>
            ${field.options.map(opt => `
              <div class="checkbox-option">
                <input type="checkbox" id="${field.id}-${opt}" name="${field.id}" value="${opt}">
                <label for="${field.id}-${opt}">${opt}</label>
              </div>
            `).join('')}
          `;
          break;

        case 'radio':
          fieldContainer.innerHTML = `
            <label>${field.label}</label>
            ${field.options.map(opt => `
              <div class="radio-option">
                <input type="radio" id="${field.id}-${opt}" name="${field.id}" value="${opt}" ${field.required ? 'required' : ''}>
                <label for="${field.id}-${opt}">${opt}</label>
              </div>
            `).join('')}
          `;
          break;
      }

      form.appendChild(fieldContainer);
    });

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Continue';
    submitButton.className = 'ai-assistant__submit';
    submitButton.type = 'submit';
    form.appendChild(submitButton);

    form.addEventListener('submit', (e) => this.handleOptionsSubmit(e));

    container.appendChild(form);
    this.el.appendChild(container);
  }

  renderChat() {
    const container = document.createElement('div');
    container.className = 'ai-assistant__chat';
    
    container.innerHTML = `
      <div class="ai-assistant__chat-messages"></div>
      <div class="ai-assistant__chat-input">
        <textarea placeholder="Type your message..."></textarea>
        <button type="button">Send</button>
      </div>
    `;

    const textarea = container.querySelector('textarea');
    const button = container.querySelector('button');

    button.addEventListener('click', () => this.handleChatSubmit(textarea.value));
    textarea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleChatSubmit(textarea.value);
      }
    });

    this.el.appendChild(container);
  }

  selectFeature(featureId) {
    this.selectedFeature = featureId;
    this.currentScreen = 'options';
    this.renderScreen();
  }

  async handleOptionsSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    this.userSelections = {
      feature: this.selectedFeature,
      options: Object.fromEntries(formData)
    };
    this.currentScreen = 'chat';
    this.renderScreen();
  }

  async handleChatSubmit(message) {
    if (!message.trim()) return;

    const messagesContainer = this.el.querySelector('.ai-assistant__chat-messages');
    const textarea = this.el.querySelector('textarea');

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-assistant__message ai-assistant__message--user';
    userMessage.textContent = message;
    messagesContainer.appendChild(userMessage);

    // Clear input
    textarea.value = '';

    // Here you would typically make an API call with the message and user selections
    // For now, we'll just simulate a response
    const response = await this.simulateAPIResponse(message);

    // Add AI response
    const aiMessage = document.createElement('div');
    aiMessage.className = 'ai-assistant__message ai-assistant__message--ai';
    aiMessage.textContent = response;
    messagesContainer.appendChild(aiMessage);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async simulateAPIResponse(message) {
    // This is a placeholder for the actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `This is a simulated response to: "${message}"\nFeature: ${this.selectedFeature}\nOptions: ${JSON.stringify(this.userSelections)}`;
  }
}

export default async function init(el) {
  new AIAssistant(el);
} 