export default async function init(el) {
  // 1) Inject initial HTML
  el.innerHTML = `
    <div class="project-header">
      <h1>🔍 Content Gap Explorer</h1>
    </div>

    <div class="search-screen" id="searchScreen">
      <div class="search-bar">
        <input type="text" id="searchInput" placeholder="Search a query..." />
        <button id="searchBtn"><i class="fa fa-search"></i> Search</button>
      </div>
    </div>

    <div class="main-content hidden" id="mainContent">
      <header class="dashboard-header">
        <div class="search-topbar" id="searchContainer">
          <input type="text" id="searchInputTop" placeholder="Search a query..." />
          <button id="searchBtnTop"><i class="fa fa-search"></i> Search</button>
        </div>
        <div id="infoPanel" class="info-panel"></div>
      </header>

      <div class="tabs">
        <button class="tab active" data-target="contentPanel">Content Improvements</button>
        <button class="tab"        data-target="visualPanel">Visual Enhancements</button>
      </div>

      <div class="panels">
        <div id="contentPanel"></div>
        <div id="visualPanel" class="hidden"></div>
      </div>
    </div>
  `;

  // 2) Grab references
  const searchScreen   = document.getElementById('searchScreen');
  const mainContent    = document.getElementById('mainContent');
  const searchInput    = document.getElementById('searchInput');
  const searchBtn      = document.getElementById('searchBtn');
  const searchInputTop = document.getElementById('searchInputTop');
  const searchBtnTop   = document.getElementById('searchBtnTop');

  const infoPanel    = document.getElementById('infoPanel');
  const tabs         = document.querySelectorAll('.tab');
  const contentPanel = document.getElementById('contentPanel');
  const visualPanel  = document.getElementById('visualPanel');

  // 3) Utility: color class by rank
  function rankClass(rank) {
    if (rank <= 2) return 'green';
    if (rank <= 5) return 'yellow';
    return 'red';
  }

  // 4) Utility: convert "(http...)" → clickable link
  function formatSource(text) {
    return text.replace(
      /\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$1" target="_blank">$1</a>'
    );
  }

  // 5) Fetch data (swap URL for real API)
  async function fetchData(query) {
    // const res = await fetch(`/api/seo-gap?query=${encodeURIComponent(query)}`);
    // return await res.json();
    // === simulate: ===
    return {
      "articleTitle": "Generate vector shape fills using text prompts",
  "articleURL": "https://helpx.adobe.com/illustrator/using/generative-shape-fill.html?akamaiLocale=en_US",
  "search_rank": 1,
  "Other Documents": [
    {
      "url": "https://www.amberddesign.com/how-to-use-generative-shape-fill/",
      "search_rank": 2
    },
    {
      "url": "https://www.reddit.com/r/AdobeIllustrator/comments/17in00t/illustrator_generative_fill/",
      "search_rank": 3
    }
  ],
  "suggestions": [
    {
      "id": 1,
      "title": "Add troubleshooting section for high demand errors",
      "description": "Based on the Reddit post, users are experiencing 'high demand' errors when trying to use Generative Shape Fill. Add a troubleshooting section addressing this common issue and providing solutions or workarounds.",
      "type": "content addition",
      "affected_area": "## Fill a shape with vector graphics",
      "source_content": "But the AI generative fill feature is not working for me. Everytime I try a prompt it says \"we are experiencing high demand, please try again\". (https://www.reddit.com/r/AdobeIllustrator/comments/17in00t/illustrator_generative_fill/)"
    },
    {
      "id": 2,
      "title": "Add section on trial version limitations",
      "description": "The Reddit post indicates that Generative Shape Fill may not work in trial versions. Add information about any limitations when using this feature in trial versions of Illustrator.",
      "type": "content addition",
      "affected_area": "## Fill a shape with vector graphics",
      "source_content": "dont work in trial (https://www.reddit.com/r/AdobeIllustrator/comments/17in00t/illustrator_generative_fill/)"
    },
    {
      "id": 3,
      "title": "Expand the creative possibilities section",
      "description": "Add a dedicated section showcasing creative possibilities and use cases for Generative Shape Fill, similar to the examples provided in the Amber Design article. This would help users understand the feature's potential applications.",
      "type": "content addition",
      "affected_area": "## More like this",
      "source_content": "### What Can I Do with the Generative Shape Fill tool? What are the Possibilities? ### 1. Combining Shapes and Colors... ### 2. Using Patterns and Textures... ### 3. Incorporating Other Design Elements... (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
    },
    {
      "id": 4,
      "title": "Include more visual examples of Shape Strength settings",
      "description": "While the current documentation includes one example of Shape Strength settings, adding more visual examples showing different settings and their effects would help users better understand how to achieve their desired results.",
      "type": "content addition",
      "affected_area": "Shape Strength: Move the slider to adjust how closely the fill must match the shape's outline.",
      "source_content": "The Gen Shape Fill setting panel provides a few customization options if you want to tweak your settings... Again, we have the Shape Strength and Detail sliders. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
    },
    {
      "id": 5,
      "title": "Add examples of effective prompts",
      "description": "Include a section with examples of effective prompts for different types of designs to help users understand how to craft prompts that produce the best results.",
      "type": "content addition",
      "affected_area": "In the prompt field, type in a description of the fill you're looking for.",
      "source_content": "For this example, we'll use more complex graphics rather than shapes, and we'll type \"add color and facial details\" into the Gen Shape Fill tool. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
    },
    {
      "id": 6,
      "title": "Clarify access to Gen Shape Fill settings",
      "description": "The current documentation mentions accessing Gen Shape Fill from various places but doesn't clearly explain all the ways to access the settings panel. Add a clear list of all methods to access both the feature and its settings.",
      "type": "content clarification",
      "affected_area": "You can also access Gen Shape Fill from the Object menu, the context menu when you right-click the shape, and the Quick Actions section of the Properties panel.",
      "source_content": "There are several ways to access the customization options. You can access the controls via the Contextual Task Bar by clicking on the three icons in the screenshot below to get more options... Alternatively, you can access these settings in the Properties panel. You can also navigate to Object> Gen Shape Fill or right-click on your selected object and select Gen Shape Fill. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
    },
    {
      "id": 7,
      "title": "Add information about system requirements",
      "description": "Include information about any specific system requirements, internet connection needs, or subscription requirements for using Generative Shape Fill.",
      "type": "content addition",
      "affected_area": "# Generate vector shape fills using text prompts",
      "source_content": "I just signed up for 7 day trial to try the generative fill features. But the AI generative fill feature is not working for me. (https://www.reddit.com/r/AdobeIllustrator/comments/17in00t/illustrator_generative_fill/)"
    },
    {
      "id": 8,
      "title": "Improve SEO with targeted keywords",
      "description": "Enhance SEO by incorporating common search terms like 'AI shape fill', 'Adobe Illustrator generative fill', 'vector pattern generator', and 'Illustrator AI tools' naturally throughout the content.",
      "type": "content addition",
      "affected_area": "# Generate vector shape fills using text prompts",
      "source_content": "One of the powerful, NEW tools that Adobe Illustrator offers is the Generative Shape Fill feature. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
    },
    {
      "id": 9,
      "title": "Add a FAQ section for common questions",
      "description": "Create a dedicated FAQ section addressing common questions about Generative Shape Fill, including limitations, best practices, and troubleshooting tips.",
      "type": "content addition",
      "affected_area": "## More like this",
      "source_content": "Did anyone experience this? Any solution? (https://www.reddit.com/r/AdobeIllustrator/comments/17in00t/illustrator_generative_fill/)"
    },
    {
      "id": 10,
      "title": "Reorganize content for better flow",
      "description": "Restructure the document to follow a more logical flow: introduction, getting started, basic usage, advanced options, creative possibilities, troubleshooting, and related features.",
      "type": "content reorganization",
      "affected_area": "# Generate vector shape fills using text prompts",
      "source_content": "Before jumping to the tutorial, let's answer a few fundamental questions! ## What is Generative Shape Fill? (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
    }
  ],
  "visual_suggestions": [
    {
      "id": 1,
      "title": "Increase Heading Font Size and Weight",
      "description": "Increase the font size and weight of all headings (e.g., \"Fill a shape with vector graphics\", \"Manage the generated variations\") to create a stronger visual hierarchy. Use a bolder font weight (e.g., semi-bold or bold) to make them stand out more. This will improve scannability and allow users to quickly identify the main topics.",
      "type": "visual adjustment",
      "affected_area": "All headings"
    },
    {
      "id": 2,
      "title": "Add Visual Separators Between Sections",
      "description": "Introduce horizontal rules or a subtle background color change between major sections (e.g., between \"Fill a shape with vector graphics\", \"Manage the generated variations\", \"Repeat shape fill generation\"). This will create better visual separation and help users understand the organization of the content.",
      "type": "visual addition/removal",
      "affected_area": "Between major sections"
    },
    {
      "id": 3,
      "title": "Improve Numbered List Styling",
      "description": "Increase the font size and change the style of the numbers in the numbered lists (e.g., steps 1, 2, 3...).  Make the numbers visually distinct and bolder to emphasize the sequence of steps. Consider using a contrasting color for the numbers to further highlight them.  Also, slightly increase the leading (line height) of the text following the numbers.",
      "type": "visual adjustment",
      "affected_area": "Step-by-step instructions"
    },
    {
      "id": 4,
      "title": "Increase Spacing Around Images/Videos",
      "description": "Add more whitespace above and below the embedded video and the fish examples. This will prevent the surrounding text from feeling cramped and give the visual elements more room to breathe, improving visual clarity and focus.",
      "type": "visual adjustment",
      "affected_area": "Images/Videos"
    },
    {
      "id": 5,
      "title": "Use a Visual Cue for Important Actions",
      "description": "For key actions described in the text (e.g., \"Select Clear all next to Styles\"), use a distinct styling like a button-style background with a contrasting font color, or a highlighted background. This will draw the user's attention to these critical steps and make them easier to follow.",
      "type": "visual addition/removal",
      "affected_area": "Instructions with specific actions"
    },
    {
      "id": 6,
      "title": "Increase Paragraph Spacing",
      "description": "Increase the spacing after each paragraph to improve readability. Currently, paragraphs are too close together, making it harder for the eye to distinguish them. This creates visual clutter and hinders comprehension.",
      "type": "visual adjustment",
      "affected_area": "All paragraphs"
    },
    {
      "id": 7,
      "title": "Visually Separate Bulleted Lists",
      "description": "Add more space above and below bulleted lists to visually separate them from the surrounding text. This makes it easier to identify list items and improve scannability.",
      "type": "visual adjustment",
      "affected_area": "Bulleted lists"
    },
    {
      "id": 8,
      "title": "Improve 'More Like This' Section",
      "description": "Visually separate the 'More Like This' section with a distinct background color (light gray or off-white) and a clear heading. This helps users easily find related content after they've finished reading the main article.",
      "type": "visual addition/removal",
      "affected_area": "\"More like this\" section"
    },
    {
      "id": 9,
      "title": "Reposition 'Try it yourself' Button",
      "description": "The placement of the 'Try it yourself' button should be either next to the video for direct relation, or after all the steps in the main section for a Call To Action at the end. Its current location feels a little disconnected.",
      "type": "element repositioning",
      "affected_area": "'Try it yourself' section"
    },
    {
      "id": 10,
      "title": "Use Icons for Important UI Elements",
      "description": "In the step-by-step instructions, include small, visually distinct icons next to the names of UI elements (e.g., the Selection tool, Gen Shape Fill button, etc.). This helps users quickly locate the corresponding elements in the Illustrator interface. The icons should be recognizable and consistent with the actual UI.",
      "type": "visual addition/removal",
      "affected_area": "Step-by-step instructions"
    }
  ]
    };
  }

  // 6) Wire up search buttons
  function bindSearch(input, button) {
    button.addEventListener('click', async () => {
      const q = input.value.trim();
      if (!q) return;
      const data = await fetchData(q);
      renderDashboard(q, data);
    });
  }
  bindSearch(searchInput, searchBtn);
  bindSearch(searchInputTop, searchBtnTop);

  // 7) Tab switching logic
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.target;
      contentPanel.classList.toggle('hidden', target !== 'contentPanel');
      visualPanel.classList.toggle('hidden',  target !== 'visualPanel');
    });
  });

  // 8) Render the dashboard after search
  function renderDashboard(query, data) {
    // hide splash, show main
    searchScreen.classList.add('hidden');
    mainContent.classList.remove('hidden');
    searchInputTop.value = query;

    // Info panel: query / HelpX Link / our rank
    infoPanel.innerHTML = `
      <div class="info-left">
        <p>🔎 <strong>Query:</strong> ${query}</p>
        <p>🔗 <a href="${data.articleURL}" target="_blank">HelpX Link</a></p>
        <p>📈 <strong>Rank:</strong>
          <span class="rank ${rankClass(data.search_rank)}">
            ${data.search_rank}
          </span>
        </p>
      </div>
      <div class="info-right">
        ${data["Other Documents"].map(doc => `
          <p>
            <a href="${doc.url}" target="_blank">${doc.url}</a>
            (Rank <span class="rank ${rankClass(doc.search_rank)}">
              ${doc.search_rank}
            </span>)
          </p>
        `).join('')}
      </div>
    `;

    // Clear panels
    contentPanel.innerHTML = '';
    visualPanel.innerHTML  = '';

    // Populate accordions
    data.suggestions.forEach(item => {
      contentPanel.appendChild(createAccordionItem(item, false));
    });
    data.visual_suggestions.forEach(item => {
      visualPanel.appendChild(createAccordionItem(item, true));
    });
  }

  // 9) Build a single accordion item
  function createAccordionItem(item, isVisual) {
    // header
    const header = document.createElement('div');
    header.className = 'accordion-header';
    header.innerHTML = `
      <span>${item.title}</span>
      <span class="toggle-icon">+</span>
    `;

    // body
    const body = document.createElement('div');
    body.className = 'accordion-body hidden';
    body.innerHTML = `
      <p><strong>Description:</strong> ${item.description}</p>
      <p><strong>Type:</strong> ${item.type}</p>
      ${!isVisual && item.source_content
        ? `<p><strong>Source:</strong> ${formatSource(item.source_content)}</p>`
        : ''
      }
      ${isVisual && item.affected_area
        ? `<p><strong>Affected Area:</strong> ${item.affected_area}</p>`
        : ''
      }
    `;

    // toggle on click
    header.addEventListener('click', () => {
      body.classList.toggle('hidden');
      header.querySelector('.toggle-icon').textContent =
        body.classList.contains('hidden') ? '+' : '–';
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'accordion-item';
    wrapper.append(header, body);
    return wrapper;
  }
}
