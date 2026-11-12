/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Store conversation history for the API
let conversationHistory = [];

// L'Oréal system prompt
const SYSTEM_PROMPT = {
  role: "system",
  content: `You are a Smart Product Advisor for L'Oréal, a global beauty leader. You specialize in:
- L'Oréal Paris skincare, makeup, and haircare products
- Personalized beauty routines and product recommendations
- Professional styling advice
- Luxury beauty guidance

Your expertise includes: Lancôme, Giorgio Armani Beauty, Yves Saint Laurent Beauty, Kérastase, Garnier, Maybelline, and other L'Oréal brands.

IMPORTANT: Only answer questions related to L'Oréal products, beauty routines, skincare, makeup, and haircare.

For off-topic questions (unrelated to beauty or L'Oréal), politely decline and redirect: 
"I'm here to help with L'Oréal products and beauty routines! Is there anything about skincare, makeup, or haircare I can help you with?"

Be conversational, helpful, and knowledgeable about beauty.`
};

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  displayUserMessage(userMessage);
  userInput.value = "";

  // Build messages array with system prompt at the start
  const messagesWithSystem = [
    SYSTEM_PROMPT,
    ...conversationHistory,
    { role: "user", content: userMessage }
  ];

  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  try {
    displayBotMessage("Thinking...");

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messagesWithSystem,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    displayBotMessage(assistantMessage);
  } catch (error) {
    console.error("Error:", error);
    displayBotMessage("Sorry, something went wrong. Please try again.");
  }
});

/* Display user message in chat */
function displayUserMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message user-message";
  messageDiv.textContent = message;
  chatWindow.appendChild(messageDiv);

  // Scroll to latest message
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Display bot message in chat */
function displayBotMessage(message) {
  // Remove "Thinking..." if present
  const thinkingMessage = chatWindow.querySelector(".bot-message:last-child");
  if (thinkingMessage && thinkingMessage.textContent === "Thinking...") {
    thinkingMessage.remove();
  }

  // Create bot message element
  const messageDiv = document.createElement("div");
  messageDiv.className = "message bot-message";
  messageDiv.textContent = message;
  chatWindow.appendChild(messageDiv);

  // Scroll to latest message
  chatWindow.scrollTop = chatWindow.scrollHeight;
}