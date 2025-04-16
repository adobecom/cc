import {
  API_COOKIE,
  API_CODE,
  API_CLIENT_SECRET,
  API_KEY,
  API_ORG_ID,
  TOKEN_URL,
  FIRE_FALL_URL
} from './constant.js';

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
    
    // Only make Home clickable if we're not on the features screen
    if (this.currentScreen !== 'features') {
      homeItem.classList.add('ai-assistant__breadcrumb-item--clickable');
      homeItem.onclick = () => this.navigateTo('features');
    }
    
    breadcrumb.appendChild(homeItem);
    
    // Add feature title if we're on the options screen
    if (this.currentScreen === 'options' && this.selectedFeature) {
      // Feature
      const featureItem = document.createElement('span');
      featureItem.className = 'ai-assistant__breadcrumb-item';
      featureItem.textContent = this.selectedFeature.title;
      breadcrumb.appendChild(featureItem);
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
    
    // Create a container for the entire content
    const contentContainer = document.createElement('div');
    contentContainer.className = 'ai-assistant__options-content';
    
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'ai-assistant__form-container';
    
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
    
    formContainer.appendChild(form);
    contentContainer.appendChild(formContainer);
    
    // Add chat container if chat has started
    if (this.chatStarted) {
      // Hide the form container
      formContainer.style.display = 'none';
      
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
      
      contentContainer.appendChild(chatContainer);
    }
    
    optionsContainer.appendChild(contentContainer);
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

  async handleSendMessage(message) {
    if (!message.trim()) return;
    
    const messagesContainer = this.container.querySelector('.ai-assistant__chat-messages');
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-assistant__message ai-assistant__message--user';
    userMessage.textContent = message;
    messagesContainer.appendChild(userMessage);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Show a loading AI message
    const aiMessage = document.createElement('div');
    aiMessage.className = 'ai-assistant__message ai-assistant__message--ai';
    aiMessage.textContent = 'Thinking...';
    messagesContainer.appendChild(aiMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      // Call the actual API (customize the payload as needed)
      const apiResponse = await getAPICall({
        messages: [
          { role: "system", content: "You are a content generation assistant for Adobe designed to help create compelling and attention-grabbing headlines for webpages. \r\nYour task is to understand the voice, tone and general tips which writers follow, and generate fresh content for a new headline while considering additional instructions listed below: \r\n\r\nVOICE : \r\nthe Adobe voice is conversational - people talking to people \u2014 no matter the product or the audience. Corporate speak is not who we are. If you write something you can'\''t imagine coming out of anyone'\''s mouth, it'\''s time for a rewrite. Our voice is encouraging and smart with a touch of the unexpected. It'\''s approachable and genuine. Casual and cool. It reflects who we are as a company: human, inspiring, progressive, and creative. Keep these words in the back of your mind when you'\''re writing.\r\n\r\nTONE: \r\nSometimes you'\''ll craft a straightforward offer and other times you'\''ll get more playful. Here are some typical tone variations with examples listed under each category in our writing:\r\nEncouraging (perfect for tutorials)\r\n\t1. What will you dream up today with Firefly?\r\n\t2. Edit videos that are uniquely you.\r\n\r\nConfident (great for talking peer to peer)\r\n1. Creativity is everywhere. Now Photoshop is too.\r\n2. Generative AI. This changes everything.\r\n\r\nEnthusiastic (talking about new features) \r\n1. We can'\''t wait to show you what'\''s next.\r\n2. See what new can do.\r\n\r\nAspirational (works for profiling a creator) \r\n1. Five million followers. One big dream. The future is yours to imagine.\r\n\r\nPlayful (ideal for social)\r\n1. Draw. Paint. Smile. \r\n\r\nAUDIENCE: \r\nOur target audiences are Hybrid Hobbyists and Mobile Enthusiasts. They are a massive opportunity for us, with more people editing photos for personal use and to stand out on social. These groups don\u2019t consider themselves photographers but rather '\''photo takers.\u201D Photo editing is fun for them and something they might do after work or on weekends. They want to have great photos but recognize they lack the skills and confidence to fully capture them.\r\nMobile Enthusiasts are intermediate to advanced mobile-first editors. They are mostly female and ages 18\u201344, They are most likely to be simple sharers, who want to connect with friends and family. They create content for Facebook, Instagram, TikTok, or Snapchat. Moving to a computer is a barrier for them.\r\nHybrid Hobbyists vary in terms of editing skill levels and edit on all surfaces. It\u2019s not uncommon for Hybrid Hobbyists to do some quick, simple edits on a mobile device before turning to their computer for further editing, or to print their images for use on a flyer, card, or poster. They\u2019re likely to be female and 18\u201344.They are social natives, build networks, and connect beyond friends and family. They create content for Facebook, Instagram, or YouTube.\r\n\r\nBoth Mobile Enthusiasts and Hybrid Hobbyists are looking for tools to easily enhance their photos, like overall brightening or making colors pop. It\u2019s about making an image look better rather than different.\r\nThey\u2019re motivated by:\r\nMobile Enthusiasts and Hybrid Hobbyists have similar reasons for taking and sharing photos. Key motivators include feeling more confident in their photo taking; being able to capture the moment as they remember it; applying their personal aesthetic and style to projects; adding extra emotional dimension to their photos; and gaining validation and differentiation by sharing photos they are proud of.\r\n\r\n\r\nHere are some GENERAL TIPS for writing:\r\n Use these insights to your advantage but don'\''t let them limit you. Because there'\''s only one rule that remains constant \u2014 if the idea is great, break the rules. \r\n\t1. Speaking human to human is appreciated by creative pros, marketers, students, teachers, and even enterprise customers. \r\n\t2.  Avoid writing that sounds like a sales pitch.\r\n\t3. Wit often works, but avoid cheesy phrases and puns.\r\n\t4. Focus on the end product. The things people create are usually more inspiring than the apps they use to create them.\r\n\t5. Don'\''t claim something is easy when it isn'\''t.\r\n\t6. Omit needless words. Cut, cut, cut.\r\n\t7. Idioms in headlines can be fun.\r\n\t8. Watch out for certain words. Avoid '\''shoot\u201D and '\''shooting.\u201D (As a noun, '\''shot'\'' is okay.) Consider words like '\''edit,\u201D '\''capture,\u201D and '\''create.\u201D The term '\''photo\u201D is preferred over '\''image,\u201D but '\''image\u201D is fine to avoid repetition.\r\n\t9. Mention how and why things are easy, space permitting: Improve your photo in just one click using Adaptive Presets in Lightroom.\r\n\t10. Call out specific use cases that people can relate to, like make skies more vibrant or whiten teeth in an instant. Also highlight important output benefits: Make your photos stand out on social media.\r\n\t11. Talk about features in the context of outcomes. Get the perfect edit on your photos faster by applying custom presets or creating your own.\r\n\t12. Focus on benefits and what users can do with their photos, like Make your photos stand out on social media or Easily edit and share photos with Lightroom.\r\n\t\r\n\r\nSPECIFIC HEADLINES RULES AND TIPS:\r\n This section has highest weightage. When you'\''re working on headlines, it'\''s good to explore a range of approaches from straightforward to unexpected. Some can be blunt and benefit driven, while others can be charged with emotion and personality driven.  we write headlines that are more tonal, inspirational, and witty with a dash of cool. It'\''s the perfect place to have fun, grab attention, and show personality. For new features, product releases, and promotions where conveying specific bits of information is most important, consider more straightforward, benefit-driven headlines. Here are some tips for writing content: \r\n\r\n1. Always create a spectrum of headlines. Come at it from different angles \u2014 some that push the envelope and others that are way out there. You may have to use a safer option, but don'\''t lead with it.\r\n2. Keep it simple, but never boring. Always try to communicate one main idea.\r\n3. Use active verbs. We often address the reader directly with imperatives. (See what you can do.)\r\n4. Embrace humor when it works. We love word play that'\''s clever, not corny.\r\n5. Use numbers to make info easier to digest. (5 tips on font selection versus How to find the right font)\r\n6. Use question format sparingly. Questions used as encouragement work well. (What'\''s a story only you can tell?)\r\n7. We'\''re fans of staccato, multi-period headlines. (Resize. Reshape. Remarkable.)\r\n provide step-by-step thoughts." },
          { role: "user", content: message }
        ],
        llm_metadata: {
          model_name: "gpt-4-32k",
          llm_type: "azure_chat_openai",
          temperature: 0.7
        }
      });

      // Replace the loading message with the real response
      aiMessage.textContent = apiResponse?.choices?.[0]?.message?.content || 
        JSON.stringify(apiResponse, null, 2);
    } catch (error) {
      aiMessage.textContent = 'Sorry, there was an error getting a response.';
      console.error(error);
    }

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

async function GetAccessToken() {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: API_COOKIE
    },
    body: JSON.stringify({
      code: API_CODE,
      client_secret: API_CLIENT_SECRET
    })
  };
  
  const response = await fetch(TOKEN_URL, options);
  console.log(response);
  if (!response.ok) throw new Error('Failed to get access token');
  const data = await response.json();
  return data.access_token;
}

async function getAPICall(payload) {
  const accessToken = await GetAccessToken();
  const options = {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'x-gw-ims-org-id': API_ORG_ID,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };

  const response = await fetch(FIRE_FALL_URL, options);
  if (!response.ok) throw new Error('API call failed');
  const data = await response.json();
  return data;
}
