# Workingai

PROJECT: AI WORKPLACE PRODUCTIVITY ASSISTANT

1. Project Overview



Build a fully functional, modern, responsive web application called AI Workplace Productivity Assistant.



The application must be an all-in-one AI-powered workplace productivity platform that helps employees, students, entrepreneurs, managers, and professionals complete everyday workplace tasks efficiently using artificial intelligence.



This must be ONE integrated application with multiple AI-powered tools accessible from a central dashboard.



The application must not be a static prototype. All major features must work and produce actual AI-generated responses.



The platform must be publicly accessible through a shareable website link. Users must NOT be required to create an account, register, sign in, or provide personal details before using the application.



2. Design and Branding



Create a premium SaaS-style dashboard with a clean, professional, modern appearance.



Colour scheme



The primary colours must be:



Primary colour: Professional bold red (#E53935).

Secondary colour: Light blue (#87CEFA).

Gradient: Smooth transitions between red and light blue.

Background: Clean white or very light grey.

Text: Dark charcoal or black.

Cards: White with subtle shadows and rounded corners.



Use red for primary buttons, important highlights, and active navigation items.



Use light-blue gradients for backgrounds, decorative elements, AI-generated content sections, and subtle visual accents.



Avoid making the interface too colourful or overwhelming. Maintain a professional corporate appearance.



Application layout



Create:



A collapsible sidebar navigation.

A professional top navigation bar.

A central dashboard.

Responsive cards and panels.

A modern AI assistant interface.

Clear input and output sections.

Loading animations while AI generates responses.

Copy, edit, regenerate, and download options for generated content.



The application must work beautifully on desktop, tablet, and mobile devices.



3. Dashboard



Create a welcoming dashboard titled:



"Your AI Workplace Productivity Hub"



Include a welcome message:



"Work smarter, save time, and achieve more with your personal AI productivity assistant."



Display six feature cards:



Smart Email Generator.

Meeting Notes Summarizer.

AI Task Planner.

AI Research Assistant.

AI Writing Assistant.

AI Workplace Chatbot.



Each card must have an icon, short description, and functional button that opens its corresponding tool.



Also include:



Total tasks created.

Emails generated during the current session.

Meeting summaries generated.

Recent activities.

Quick access to AI tools.



Do not display fabricated usage statistics. Use real session activity or clearly label example content.



4. AI-Powered Features



All the following features must use actual AI processing and generate meaningful responses based on user input.



FEATURE 1: Smart Email Generator



Build an AI-powered email creation tool.



Input fields:



Email subject or purpose.

Recipient.

Main points to communicate.

Additional instructions.

Language selection.

Tone selection.



Tone options:



Formal.

Friendly.

Professional.

Persuasive.

Apologetic.

Confident.

Concise.



The AI must generate a complete, well-structured email with:



Subject line.

Greeting.

Email body.

Professional closing.



Include buttons:



Generate Email.

Copy Email.

Edit Email.

Regenerate.

Download Email.

FEATURE 2: Meeting Notes Summarizer



Create a tool that converts lengthy meeting notes into structured summaries.



Allow users to paste meeting notes into a large text area.



The AI must extract:



Meeting overview.

Main discussion points.

Important decisions.

Action items.

Responsible persons, where specified.

Deadlines, where specified.

Outstanding questions.

Recommended next steps.



Present the results in clearly separated sections.



Include:



Summarize Notes button.

Copy Summary.

Edit Summary.

Download Summary.

Regenerate Summary.



Never invent decisions, deadlines, or assigned individuals that were not included in the source notes. Clearly indicate missing information.



FEATURE 3: AI Task Planner



Build an intelligent task management and scheduling assistant.



Allow users to enter:



Task name.

Task description.

Priority.

Deadline.

Estimated completion time.

Available working hours.

Additional instructions.



The AI must:



Organise tasks by priority.

Identify urgent tasks.

Recommend realistic schedules.

Generate daily plans.

Generate weekly plans.

Suggest breaks.

Identify possible scheduling conflicts.

Recommend improvements to productivity.



Display schedules in an attractive, organised layout.



Include options to:



Add tasks.

Edit tasks.

Delete tasks.

Mark tasks as completed.

Regenerate schedules.

Copy or download schedules.

FEATURE 4: AI Research Assistant



Create an AI research tool that helps users understand workplace topics and gather information.



Users must be able to enter a research question or topic.



The AI should:



Explain complex topics.

Generate research summaries.

Identify key findings.

Provide structured explanations.

Suggest further research questions.

Identify limitations and uncertainty.



When web research is available, provide source links and distinguish verified information from AI-generated explanations.



Do not invent references or citations.



FEATURE 5: AI Writing Assistant



Build a writing improvement tool.



Allow users to paste text and choose an action:



Improve grammar.

Rewrite professionally.

Simplify language.

Expand content.

Summarise text.

Improve clarity.

Convert into bullet points.

Make writing more persuasive.



Allow users to select their preferred tone and output language.



Provide editable results and copy/download functionality.



FEATURE 6: AI Workplace Chatbot



Build a conversational AI assistant inside the application.



Name it "WorkMate AI".



The chatbot must:



Answer workplace-related questions.

Help users brainstorm ideas.

Explain difficult concepts.

Assist with productivity.

Help write professional documents.

Recommend ways to improve workflows.

Support multilingual conversations.



Include:



Chat input.

Send button.

Conversation history during the current session.

Clear conversation button.

Suggested questions.

AI response loading indicator.



The chatbot should respond naturally and professionally.



5. Multilingual Support: 50+ Languages



This is a very important requirement.



The application must support at least 50 languages across its AI-powered features.



Include a language selector in the main interface and within individual AI tools.



Support at least the following languages:



English

Afrikaans

isiZulu

isiXhosa

Sesotho

Setswana

Sepedi

Xitsonga

siSwati

Tshivenda

French

Spanish

Portuguese

German

Italian

Dutch

Swedish

Norwegian

Danish

Finnish

Polish

Russian

Ukrainian

Greek

Turkish

Arabic

Hebrew

Hindi

Urdu

Bengali

Punjabi

Tamil

Telugu

Marathi

Gujarati

Chinese Simplified

Chinese Traditional

Japanese

Korean

Thai

Vietnamese

Indonesian

Malay

Filipino

Swahili

Amharic

Somali

Yoruba

Igbo

Hausa

Romanian

Hungarian

Czech

Slovak

Bulgarian

Croatian

Serbian

Persian

Nepali

Irish



The selected language must affect the actual AI-generated response, not just translate the interface labels.



Users must be able to provide instructions in their preferred language and receive responses in that language.



Use the selected language consistently across all six AI tools.



6. Actual AI Integration



This is one of the most important technical requirements.



The application MUST connect to a real AI model/API to generate responses.



Do not build a fake AI chatbot or use predefined responses disguised as AI.



Implement a secure AI integration using Lovable's supported AI integration or a suitable external AI provider.



Requirements:



Real-time AI-generated responses.

Structured prompts for every tool.

Context-aware responses.

Multilingual generation.

Error handling.

Loading states.

Retry functionality.

Secure API key management.



Never expose secret API keys in frontend code.



Use secure server-side functions or supported integrations for AI requests.



Create reusable AI processing functionality so that all six tools can use the same secure AI connection with different specialised prompts.



If an AI service requires an API key or configuration, clearly identify the required setup rather than silently presenting a non-functional feature.



7. Public Access Without Registration



This application must be publicly accessible.



IMPORTANT:



Do not create a login page.

Do not create a registration page.

Do not require email verification.

Do not require users to create accounts.

Do not require passwords.

Do not restrict the main AI tools behind authentication.



Anyone with the published website link must be able to open the application and use its productivity tools immediately.



Users should be able to:



Open the application.

Select an AI tool.

Enter their information.

Generate AI responses.

Edit their results.

Copy or download their results.



Store temporary activity in browser session storage where appropriate.



Do not store confidential workplace information unnecessarily.



8. Responsible AI and Privacy



Include a Responsible AI notice in the application.



Display the following disclaimer:



"AI-generated content may contain errors or inaccuracies. Always review and verify AI-generated information before using it for important workplace decisions. Do not submit confidential, sensitive, or personally identifiable information. Users remain responsible for reviewing and approving all AI-generated content."



Include:



Privacy-conscious data handling.

Secure API communication.

No unnecessary personal data collection.

No storage of sensitive workplace documents by default.

Clear error messages.

Transparency that responses are AI-generated.

9. User Interface Requirements



Make the application visually impressive and easy to navigate.



Sidebar navigation:



Dashboard.

Smart Email Generator.

Meeting Notes Summarizer.

AI Task Planner.

AI Research Assistant.

AI Writing Assistant.

WorkMate AI Chatbot.

Settings.

About.



Top navigation:



Application logo.

Application name.

Language selector.

Theme toggle.

User-free public access indicator.



Use professional icons, consistent spacing, attractive cards, subtle animations, and smooth navigation.



The design should look like a polished commercial SaaS product rather than a basic school assignment.



10. Technical Requirements



Build the application using a suitable modern technology stack supported by Lovable.



Requirements:



Responsive frontend.

Functional navigation.

Reusable components.

Secure AI integration.

Error handling.

Persistent task management where appropriate.

Session-based chatbot history.

Multilingual AI prompts.

Editable AI-generated outputs.

Accessible controls.

Mobile-friendly layout.



Do not create buttons that do nothing.



Do not leave placeholder features pretending to be functional.



Ensure all six tools work independently while sharing the same application design and AI infrastructure.



11. Final Testing



Before considering the application complete, test:



All six AI tools.

Actual AI response generation.

All 60 language options

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a1d38b93-9b76-48d7-97d9-0a2a44352cd7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
