class AIAssistant {
  constructor(container) {
    this.container = container;
    this.data = null;
    this.currentScreen = 'features';
    this.selectedFeature = null;
    this.selectedOptions = {};
    this.chatStarted = false;
    this.init();
  }

  async init() {
    try {
      await this.fetchData();
      this.renderScreen();
    } catch (error) {
      console.error('Failed to initialize AI Assistant:', error);
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
      console.error('Failed to fetch AI Assistant data:', error);
      throw error;
    }
  }

  renderScreen() {
    this.container.innerHTML = '';
    
    // Always render navigation
    this.renderNavigation();

    switch (this.currentScreen) {
      case 'features':
        this.renderFeaturesScreen();
        break;
      case 'options':
        this.renderOptionsScreen();
        break;
    }
  }

  renderNavigation() {
    const nav = document.createElement('div');
    nav.className = 'ai-assistant__nav';
    
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'ai-assistant__breadcrumb';
    
    // Home
    const homeItem = document.createElement('span');
    homeItem.className = 'ai-assistant__breadcrumb-item';
    homeItem.textContent = 'Home';
    homeItem.onclick = () => this.navigateTo('features');
    breadcrumb.appendChild(homeItem);
    
    if (this.currentScreen === 'options' && this.selectedFeature) {
      // Feature
      const featureItem = document.createElement('span');
      featureItem.className = 'ai-assistant__breadcrumb-item';
      featureItem.textContent = this.selectedFeature.title;
      featureItem.onclick = () => this.navigateTo('features');
      breadcrumb.appendChild(featureItem);
      
      // Options
      const optionsItem = document.createElement('span');
      optionsItem.className = 'ai-assistant__breadcrumb-item';
      optionsItem.textContent = 'Options';
      optionsItem.onclick = () => this.navigateTo('options');
      breadcrumb.appendChild(optionsItem);
    }
    
    nav.appendChild(breadcrumb);
    this.container.appendChild(nav);
  }

  renderFeaturesScreen() {
    const featuresContainer = document.createElement('div');
    featuresContainer.className = 'ai-assistant__features';
    
    this.data.features.forEach(feature => {
      const card = document.createElement('div');
      card.className = 'ai-assistant__feature-card';
      card.onclick = () => this.selectFeature(feature);
      
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
      
      featuresContainer.appendChild(card);
    });
    
    this.container.appendChild(featuresContainer);
  }

  renderOptionsScreen() {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'ai-assistant__options';
    
    const title = document.createElement('h2');
    title.textContent = this.selectedFeature.title;
    optionsContainer.appendChild(title);
    
    const form = document.createElement('form');
    form.className = 'ai-assistant__form';
    form.onsubmit = (e) => this.handleOptionsSubmit(e);
    
    // Get options for the selected feature
    const featureOptions = this.data.options[this.selectedFeature.id];
    if (!featureOptions || !featureOptions.fields) {
      console.error('No options found for feature:', this.selectedFeature.id);
      return;
    }
    
    featureOptions.fields.forEach(field => {
      const fieldContainer = document.createElement('div');
      fieldContainer.className = 'ai-assistant__field';
      
      const label = document.createElement('label');
      label.textContent = field.label;
      fieldContainer.appendChild(label);
      
      switch (field.type) {
        case 'select':
          const select = document.createElement('select');
          select.name = field.id;
          select.required = field.required || false;
          
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = 'Select an option';
          select.appendChild(defaultOption);
          
          field.options.forEach(opt => {
            const optionElement = document.createElement('option');
            optionElement.value = opt;
            optionElement.textContent = opt;
            select.appendChild(optionElement);
          });
          
          fieldContainer.appendChild(select);
          break;
          
        case 'textarea':
          const textarea = document.createElement('textarea');
          textarea.name = field.id;
          textarea.required = field.required || false;
          textarea.placeholder = field.placeholder || '';
          textarea.rows = field.rows || 4;
          fieldContainer.appendChild(textarea);
          break;
          
        case 'checkbox':
          const checkboxContainer = document.createElement('div');
          checkboxContainer.className = 'checkbox-group';
          
          field.options.forEach(opt => {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkbox-option';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = field.id;
            input.value = opt;
            input.id = `${field.id}-${opt}`;
            
            const optLabel = document.createElement('label');
            optLabel.htmlFor = `${field.id}-${opt}`;
            optLabel.textContent = opt;
            
            checkboxWrapper.appendChild(input);
            checkboxWrapper.appendChild(optLabel);
            checkboxContainer.appendChild(checkboxWrapper);
          });
          
          fieldContainer.appendChild(checkboxContainer);
          break;
          
        case 'radio':
          const radioContainer = document.createElement('div');
          radioContainer.className = 'radio-group';
          
          field.options.forEach(opt => {
            const radioWrapper = document.createElement('div');
            radioWrapper.className = 'radio-option';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = field.id;
            input.value = opt;
            input.id = `${field.id}-${opt}`;
            input.required = field.required || false;
            
            const optLabel = document.createElement('label');
            optLabel.htmlFor = `${field.id}-${opt}`;
            optLabel.textContent = opt;
            
            radioWrapper.appendChild(input);
            radioWrapper.appendChild(optLabel);
            radioContainer.appendChild(radioWrapper);
          });
          
          fieldContainer.appendChild(radioContainer);
          break;
      }
      
      form.appendChild(fieldContainer);
    });
    
    const submitButton = document.createElement('button');
    submitButton.className = 'ai-assistant__submit';
    submitButton.textContent = 'Start Chat';
    form.appendChild(submitButton);
    
    optionsContainer.appendChild(form);
    
    // Add chat container if chat has started
    if (this.chatStarted) {
      const chatContainer = document.createElement('div');
      chatContainer.className = 'ai-assistant__chat';
      
      const messagesContainer = document.createElement('div');
      messagesContainer.className = 'ai-assistant__chat-messages';
      chatContainer.appendChild(messagesContainer);
      
      const inputContainer = document.createElement('div');
      inputContainer.className = 'ai-assistant__chat-input';
      
      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Type your message...';
      textarea.rows = 1;
      textarea.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage(textarea.value);
          textarea.value = '';
        }
      };
      
      const sendButton = document.createElement('button');
      sendButton.textContent = 'Send';
      sendButton.onclick = () => {
        this.handleSendMessage(textarea.value);
        textarea.value = '';
      };
      
      inputContainer.appendChild(textarea);
      inputContainer.appendChild(sendButton);
      chatContainer.appendChild(inputContainer);
      
      optionsContainer.appendChild(chatContainer);
    }
    
    this.container.appendChild(optionsContainer);
  }

  selectFeature(feature) {
    this.selectedFeature = feature;
    this.currentScreen = 'options';
    this.chatStarted = false;
    this.renderScreen();
  }

  handleOptionsSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    this.selectedOptions = {};
    for (let [key, value] of formData.entries()) {
      this.selectedOptions[key] = value;
    }
    
    this.chatStarted = true;
    this.renderScreen();
  }

  handleSendMessage(message) {
    if (!message.trim()) return;
    
    const messagesContainer = this.container.querySelector('.ai-assistant__chat-messages');
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-assistant__message ai-assistant__message--user';
    userMessage.textContent = message;
    messagesContainer.appendChild(userMessage);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage = document.createElement('div');
      aiMessage.className = 'ai-assistant__message ai-assistant__message--ai';
      aiMessage.textContent = `I understand you want to work on ${this.selectedFeature.title} with these options: ${Object.values(this.selectedOptions).join(', ')}. How can I help you further?`;
      messagesContainer.appendChild(aiMessage);
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  navigateTo(screen) {
    if (screen === 'features') {
      this.currentScreen = 'features';
      this.selectedFeature = null;
      this.chatStarted = false;
    } else if (screen === 'options' && this.selectedFeature) {
      this.currentScreen = 'options';
    }
    this.renderScreen();
  }
}

// Initialize the AI Assistant
export default async function init(el) {
  if (!el) return;
  
  // Create container if not exists
  let container = el.querySelector('.ai-assistant');
  if (!container) {
    container = document.createElement('div');
    container.className = 'ai-assistant';
    el.appendChild(container);
  }
  
  // Initialize the assistant
  new AIAssistant(container);
} 