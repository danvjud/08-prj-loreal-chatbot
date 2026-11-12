/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Store conversation history for the API
let conversationHistory = [];

// Cloudflare Worker URL (replace with your actual deployed URL)
const WORKER_URL = "https://loreal-project-chatbot.dannjudson.workers.dev/";

// Set initial message
chatWindow.innerHTML = '<div class="message bot-message">👋 Hello! How can I help you today?</div>';

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user message from input field
  const userMessage = userInput.value.trim();

  // Prevent empty messages
  if (!userMessage) return;

  // Display user message in chat window
  displayUserMessage(userMessage);

  // Clear input field and focus for next message
  userInput.value = "";

  // Add user message to conversation history
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  try {
    // Show loading indicator
    displayBotMessage("Thinking...");

    // Send request to Cloudflare Worker
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Parse response
    const data = await response.json();

    // Extract assistant message from response
    const assistantMessage = data.choices[0].message.content;

    // Add assistant message to conversation history
    conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    // Display assistant message in chat window
    displayBotMessage(assistantMessage);
  } catch (error) {
    // Handle errors gracefully
    console.error("Error:", error);
    displayBotMessage(
      "Sorry, something went wrong. Please check your connection and try again."
    );
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