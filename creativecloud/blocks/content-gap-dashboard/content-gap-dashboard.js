export default async function init(el) {
  el.innerHTML = `
    <div class="search-screen" id="searchScreen">
      <div class="search-bar">
        <input type="text" id="searchInput" placeholder="Search a query..." />
        <button id="searchBtn"><i class="fa fa-search"></i> Search</button>
      </div>
    </div>

    <nav class="sidebar hidden" id="sidebar">
      <a href="#contentSuggestions">📝 Content Improvements</a>
      <a href="#visualSuggestions">🎨 Visual Enhancements</a>
      <a href="#compareUrls">🔗 Compare URLs</a>
    </nav>

    <div class="main-content hidden" id="mainContent">
      <header class="dashboard-header" id="dashboardHeader">
        <div id="searchContainer" class="search-topbar">
          <input type="text" id="searchInputTop" placeholder="Search a query..." />
          <button id="searchBtnTop"><i class="fa fa-search"></i> Search</button>
        </div>
        <div class="page-meta" id="pageMeta"></div>
      </header>

      <main class="dashboard-grid" id="dashboardGrid">
        <section id="contentSuggestions"><h3>✍️ Content Improvements</h3></section>
        <section id="visualSuggestions"><h3>🎨 Visual Enhancements</h3></section>
        <section id="compareUrls"><h3>🔗 Compare URLs</h3></section>
      </main>
    </div>
  `;

  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchScreen = document.getElementById('searchScreen');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const searchInputTop = document.getElementById('searchInputTop');
  const searchBtnTop = document.getElementById('searchBtnTop');

  const sections = {
    contentSuggestions: document.getElementById('contentSuggestions'),
    visualSuggestions: document.getElementById('visualSuggestions'),
    compareUrls: document.getElementById('compareUrls')
  };

  async function fetchData(query) {
   //  const res = await fetch('mock-data.json'); // Replace with real API later
    // if (!res.ok) throw new Error('Failed to fetch');
    // return await res.json();
    return {
      "articleTitle": "Generate vector shape fills using text prompts",
      "articleURL": "https://helpx.adobe.com/illustrator/using/generative-shape-fill.html?akamaiLocale=en_US",
      "Other Documents": [
        "https://www.amberddesign.com/how-to-use-generative-shape-fill/",
        "https://helpx.adobe.com/express/create-and-edit-images/create-and-modify-with-generative-ai/insert-object-gen-fill.html?akamaiLocale=en_US"
      ],
      "suggestions": [
        {
          "id": 1,
          "title": "Add a Quick Start Guide section",
          "description": "Include a concise 'Quick Start Guide' section at the beginning of the article that provides the absolute basics for users who want to immediately start using the feature without reading the entire documentation. This would address the need for quick implementation that's evident in the Amber D Design article.",
          "type": "content addition",
          "source_content": "In graphic design, innovation and creativity are crucial for standing out. One of the powerful, NEW tools that Adobe Illustrator offers is the Generative Shape Fill feature. This function allows designers to create intricate and unique shapes that can significantly enhance their projects. In this comprehensive tutorial, we will explore the new Generative Shape Fill tool, learn how to use it effectively and share tips for maximizing its potential in your design endeavors. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
        },
        {
          "id": 2,
          "title": "Expand the 'Possibilities' section with real-world applications",
          "description": "Create a dedicated section that showcases specific real-world applications and creative possibilities of Generative Shape Fill. Include examples like combining shapes and colors, using patterns and textures, and incorporating other design elements as mentioned in the Amber D Design article.",
          "type": "content addition",
          "source_content": "1. Combining Shapes and Colors: One of the exciting aspects of using Generative Shape Fill is the ability to combine multiple filled shapes. You can create visually arresting compositions that capture attention by layering different shapes with various fill options. Consider using contrasting colors or complementary patterns to enhance visual interest. This layering technique can add dimension and complexity, making your artwork truly unique. 2. Using Patterns and Textures: Generative Shape Fill also allows you to incorporate patterns and textures into your designs. Instead of solely relying on solid colors, explore the potential of intricate patterns that can convey themes or moods effectively. 3. Incorporating Other Design Elements: Don't hesitate to incorporate other design elements like typography or images alongside your filled shapes. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
        },
        {
          "id": 3,
          "title": "Include a troubleshooting section",
          "description": "Add a troubleshooting section that addresses common issues users might encounter when using Generative Shape Fill, such as what to do if the feature doesn't appear in the menu, how to handle unexpected results, or what to do if the generation process is slow.",
          "type": "content addition",
          "source_content": "The only thing that you need to ensure is that the shape is closed; open paths will not support the Generative Shape Fill feature. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
        },
        {
          "id": 4,
          "title": "Add tips for creating effective prompts",
          "description": "Include specific guidance on how to write effective prompts for Generative Shape Fill. This would help users get better results from the AI generation process and reduce frustration from unclear or ineffective prompts.",
          "type": "content addition",
          "source_content": "You can type whatever you like and let Illustrator do its thing! For example, you can instruct it to add more details and color your graphic. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
        },
        {
          "id": 5,
          "title": "Clarify the difference between Generative Shape Fill and other Adobe AI tools",
          "description": "Add a section that clearly explains the differences between Generative Shape Fill in Illustrator and similar AI-powered features in other Adobe products (like Generative Fill in Express). This would help users understand when to use each tool for specific design needs.",
          "type": "content clarification",
          "source_content": "Insert or replace objects with generative AI - Learn how to insert or replace objects in an image using simple text inputs. (https://helpx.adobe.com/express/create-and-edit-images/create-and-modify-with-generative-ai/insert-object-gen-fill.html?akamaiLocale=en_US)"
        },
        {
          "id": 6,
          "title": "Enhance the 'Manage the generated variations' section",
          "description": "Expand the 'Manage the generated variations' section with more detailed instructions on how to effectively organize, save, and reuse favorite variations. Include information about best practices for managing variations across multiple projects.",
          "type": "content clarification",
          "source_content": "After applying the Generative Shape Fill, take some time to refine your design if necessary. Use the Selection Tool to adjust the size or position of the filled shape within your layout. You may also want to manipulate additional elements, such as adding strokes or layering other shapes to create depth. The flexibility of Illustrator allows you to tweak your design until it aligns perfectly with your vision. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
        },
        {
          "id": 7,
          "title": "Add a section on best practices for color theory and visual balance",
          "description": "Include a section on best practices that covers color theory and maintaining visual balance when using Generative Shape Fill, similar to the tips provided in the Amber D Design article. This would help users create more professional and aesthetically pleasing designs.",
          "type": "content addition",
          "source_content": "Understanding Color Theory: Having a solid foundation in color theory can significantly impact your design process. Whenever you use Generative Shape Fill, consider color harmony and contrast. Utilize tools like Adobe Color to explore complementary and analogous color schemes that resonate with your project's theme. Understanding how colors affect mood and perception will help you create more impactful designs. Maintaining Visual Balance: Visual balance is crucial in design, especially when using dynamic fills. Strive for an equilibrium between filled shapes and negative space to avoid overwhelming your audience. Use the Rule of Thirds or Golden Ratio to guide your layout decisions, ensuring your design feels cohesive and intentional. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
        },
        {
          "id": 8,
          "title": "Reorganize the content flow for better readability",
          "description": "Reorganize the content to follow a more intuitive flow: starting with a brief overview, followed by a quick start guide, then detailed instructions, advanced techniques, and finally troubleshooting and best practices. This would make the documentation more accessible to both beginners and experienced users.",
          "type": "content reorganization",
          "source_content": "Before jumping to the tutorial, let's answer a few fundamental questions! What is Generative Shape Fill? Generative Shape Fill in Adobe Illustrator is a new feature that allows designers to fill shapes with complex patterns and textures that are generated algorithmically. Unlike traditional fill methods, which rely on solid colors or simple gradients, Generative Shape Fill enables the creation of dynamic fills that can evolve based on parameters set by the user. This powerful feature is handy for creating visually engaging graphics to capture the viewer's attention. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
        },
        {
          "id": 9,
          "title": "Add more visual examples with before/after comparisons",
          "description": "Include more visual examples showing before and after comparisons of shapes with Generative Shape Fill applied. These should demonstrate different settings, styles, and prompt variations to give users a better understanding of the feature's capabilities.",
          "type": "content addition",
          "source_content": "For this example, we'll use more complex graphics rather than shapes, and we'll type 'add color and facial details' into the Gen Shape Fill tool. Illustrator will start adding the details and coloring the artwork. The Properties panel will also suggest three versions from which you can pick. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
        },
        {
          "id": 10,
          "title": "Improve SEO with targeted keywords and meta description",
          "description": "Enhance the SEO of the page by incorporating more targeted keywords throughout the content, particularly in headings and the first paragraph. Keywords should include 'AI vector fill', 'Adobe Firefly shape fill', 'generative vector graphics', 'AI pattern generation', and 'Illustrator AI tools'. Also, create a more descriptive meta description that includes these keywords and clearly explains the feature's benefits.",
          "type": "content addition",
          "source_content": "The significance of Generative Shape Fill lies in its ability to foster creativity and exploration. Designers can experiment with various algorithms and parameters to yield unexpected results, pushing the boundaries of digital art. This tool is not only a time-saver but also a way to introduce uniqueness into artwork, making it a vital asset for both professional graphic designers and enthusiasts alike. (https://www.amberddesign.com/how-to-use-generative-shape-fill/)"
        }
      ],
      "visual_suggestions": [
        {
          "id": 1,
          "title": "Increase Main Heading Font Size and Weight",
          "description": "Increase the font size of the main title, 'Generate vector shape fills using text prompts', to at least 32px and make it bold. This will significantly enhance the visual hierarchy, making the title more prominent and easier to grasp at first glance.",
          "type": "visual adjustment",
          "affected_area": "Main heading"
        },
        {
          "id": 2,
          "title": "Add Visual Hierarchy to Subheadings",
          "description": "Increase the font size and weight of all subheadings (e.g., 'Fill a shape with vector graphics', 'Manage the generated variations', etc.). Use a consistent visual style (e.g., a different font or background color) to differentiate them from the body text and create a clear visual hierarchy. Aim for around 20px font size and bold weight.",
          "type": "visual adjustment",
          "affected_area": "All subheadings throughout the article"
        },
        {
          "id": 3,
          "title": "Improve Spacing Around Paragraphs and Headings",
          "description": "Increase the spacing above and below headings and paragraphs. Add at least 16px of vertical spacing before each heading and 8px after. For paragraphs, increase the line-height to 1.5 and add 8px of margin below each paragraph. This will improve readability by providing more visual breathing room.",
          "type": "visual adjustment",
          "affected_area": "All headings and paragraphs"
        },
        {
          "id": 4,
          "title": "Visually Distinguish Step-by-Step Instructions",
          "description": "The numbered steps (1, 2, 3...) need better visual distinction. Place each step within a bordered box with a light background color (e.g., light gray). Add padding inside the box to separate the text from the border. Make the number itself visually prominent (e.g., larger font size, bold, and a contrasting background color within the box).",
          "type": "visual adjustment",
          "affected_area": "Step-by-step instructions"
        },
        {
          "id": 5,
          "title": "Use Bullet Points for Lists with Consistent Indentation",
          "description": "The bulleted lists are difficult to quickly scan. Use proper bullet points instead of hyphens. Add a left margin of at least 20px for all bulleted lists to clearly separate them from the surrounding text. Maintain a consistent indentation for each level of the list.",
          "type": "visual adjustment",
          "affected_area": "All bulleted lists"
        },
        {
          "id": 6,
          "title": "Emphasize Important Keywords with Bold Text",
          "description": "Use bold text strategically to highlight key terms and actions within the instructions. For example, in step 1, bold the names of UI elements, actions and specific terms like 'Selection tool', 'Gen Shape Fill', 'Properties panel' to draw the user's attention.",
          "type": "visual adjustment",
          "affected_area": "Throughout the instructions"
        },
        {
          "id": 7,
          "title": "Add Captions to Images",
          "description": "Add short, descriptive captions below each image. Use a smaller font size (e.g., 12px) and a muted color (e.g., gray) for the captions. Captions should briefly explain what the image is showing and its relevance to the surrounding text.",
          "type": "visual addition/removal",
          "affected_area": "Images"
        },
        {
          "id": 8,
          "title": "Increase Contrast for 'Try it yourself' Button",
          "description": "Increase the contrast of the 'Try it yourself' button. Currently, the blue color is not prominent enough. Use a brighter blue or another visually distinct color. Add a bolder font to improve readability.",
          "type": "visual adjustment",
          "affected_area": "'Try it yourself' button"
        },
        {
          "id": 9,
          "title": "Consolidate Related Information",
          "description": "Group related information into clearly defined sections using subtle background shading to improve the visual structure. For example, the 'More like this' and 'Have a question or an idea?' sections could benefit from being visually separated from the main content body with a light gray background.",
          "type": "visual adjustment",
          "affected_area": "'More like this' and 'Have a question or an idea?' sections"
        },
        {
          "id": 10,
          "title": "Reduce Visual Clutter and Increase Whitespace",
          "description": "Reduce visual clutter by removing unnecessary lines and borders. Increase whitespace around page elements to give the content room to breathe. This will improve scannability and readability by making the page less dense and more visually appealing.",
          "type": "visual adjustment",
          "affected_area": "Entire page"
        }
      ]
    }
  }

  function bindSearch(input, button) {
    button.addEventListener('click', async () => {
      const query = input.value.trim();
      if (!query) return;
      try {
        const data = await fetchData(query);
        showDashboard(query, data);
      } catch (err) {
        alert('Failed to fetch data');
      }
    });
  }

  function showDashboard(query, data) {
    searchInputTop.value = query;
    searchScreen.classList.add('hidden');
    sidebar.classList.remove('hidden');
    mainContent.classList.remove('hidden');
    renderDashboard(data);
    showSection('contentSuggestions');
  }

  function renderDashboard(data) {
    renderMeta(data);
    renderCompareUrls(data["Other Documents"]);
    loadContentSuggestions(data.suggestions);
    loadVisualSuggestions(data.visual_suggestions);
  }

  function renderMeta(data) {
    const meta = document.getElementById('pageMeta');
    meta.innerHTML = `
      <h2><span class="icon">📰</span> Article: <a href="${data.articleURL}" target="_blank">${data.articleTitle}</a></h2>
    `;
  }

  function loadContentSuggestions(suggestions) {
    const el = sections.contentSuggestions;
    const filtered = suggestions.filter(s => s.type !== 'visual adjustment');
    el.innerHTML += filtered.length
      ? filtered.map(createCard).join('')
      : '<p class="empty-message">No content suggestions available.</p>';
  }

  function loadVisualSuggestions(suggestions) {
    const el = sections.visualSuggestions;
    el.innerHTML += suggestions.length
      ? suggestions.map(createCard).join('')
      : '<p class="empty-message">No visual suggestions available.</p>';
  }

  function renderCompareUrls(urls) {
    const el = sections.compareUrls;
    el.innerHTML += urls.length
      ? '<ul class="compare-list">' + urls.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join('') + '</ul>'
      : '<p class="empty-message">No competitor URLs found.</p>';
  }

  function formatSourceContent(text) {
    const linkedText = text.replace(/\((https?:\/\/[^\s)]+)\)/g, '<a href="$1" target="_blank">$1</a>');
    const parts = linkedText.match(/\d+\.\s.*?(?=(?:\d+\.|$))/gs);
    if (parts && parts.length >= 2) {
      return '<ul>' + parts.map(p => `<li>${p.trim()}</li>`).join('') + '</ul>';
    }
    return linkedText;
  }

  function createCard(item) {
    const icons = {
      'content addition': '➕',
      'content clarification': '📝',
      'content deletion': '❌',
      'content reorganization': '🔀',
      'visual adjustment': '🎨',
      'visual addition/removal': '🖼️'
    };

    const formattedSource = item.source_content
    ? formatSourceContent(item.source_content)
    : '';

    return `
      <div class="suggestion-card">
        <div class="card-header">
          ${icons[item.type] || '📌'} ${item.title}
          <span class="tag">${item.type}</span>
        </div>
        <div class="card-body">
          <p>${item.description}</p>
          ${item.affected_area ? `<p><strong>📍 Affected Area:</strong> ${item.affected_area}</p>` : ''}
          ${
            formattedSource
              ? `<details>
                   <summary>🔎 View Source</summary>
                   <blockquote>${formattedSource}</blockquote>
                 </details>`
              : ''
          }
        </div>
      </div>
    `;
  }

  function showSection(sectionId) {
    Object.keys(sections).forEach(id => {
      sections[id].style.display = id === sectionId ? 'block' : 'none';
    });
  }

  document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const id = link.getAttribute('href').substring(1);
      showSection(id);
    });
  });

  bindSearch(searchInput, searchBtn);
  bindSearch(searchInputTop, searchBtnTop);
}
