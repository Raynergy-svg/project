/**
 * Simple test script for the chat API
 *
 * Usage:
 * 1. Start the server: npm run server
 * 2. Run this script: node src/server/tests/chat-test.js
 */

import fetch from "node-fetch";
import readline from "readline";

// Configuration
const API_BASE_URL = "http://localhost:3001/api/chat";
const USER_TOKEN = "YOUR_JWT_TOKEN"; // Replace with a valid JWT token

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Store session ID
let sessionId = null;

/**
 * Create a new chat session
 */
async function createSession() {
  try {
    console.log("Creating a new chat session...");

    const response = await fetch(`${API_BASE_URL}/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${USER_TOKEN}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error creating session:", data.error);
      return false;
    }

    sessionId = data.sessionId;
    console.log(`Session created with ID: ${sessionId}`);
    console.log(`AI: ${data.message}`);

    if (data.suggestedActions && data.suggestedActions.length > 0) {
      console.log("Suggested actions:");
      data.suggestedActions.forEach((action) => {
        console.log(`- ${action.label}: "${action.value}"`);
      });
    }

    return true;
  } catch (error) {
    console.error("Error creating session:", error.message);
    return false;
  }
}

/**
 * Send a message to the chat API
 */
async function sendMessage(message) {
  try {
    console.log(`Sending message: "${message}"`);

    const response = await fetch(`${API_BASE_URL}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${USER_TOKEN}`,
      },
      body: JSON.stringify({
        sessionId,
        message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error sending message:", data.error);
      return;
    }

    console.log(`AI: ${data.message}`);

    if (data.suggestedActions && data.suggestedActions.length > 0) {
      console.log("Suggested actions:");
      data.suggestedActions.forEach((action) => {
        console.log(`- ${action.label}: "${action.value}"`);
      });
    }
  } catch (error) {
    console.error("Error sending message:", error.message);
  }
}

/**
 * Get chat history
 */
async function getChatHistory() {
  try {
    console.log("Retrieving chat history...");

    const response = await fetch(`${API_BASE_URL}/history/${sessionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${USER_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error retrieving chat history:", data.error);
      return;
    }

    console.log("Chat history:");
    data.messages.forEach((msg) => {
      const role = msg.role === "user" ? "You" : "AI";
      console.log(
        `${role} (${new Date(msg.timestamp).toLocaleTimeString()}): ${
          msg.content
        }`
      );
    });
  } catch (error) {
    console.error("Error retrieving chat history:", error.message);
  }
}

/**
 * Start the chat test
 */
async function startChatTest() {
  console.log("=== Chat API Test ===");

  // Create a new session
  const sessionCreated = await createSession();
  if (!sessionCreated) {
    console.log("Failed to create session. Exiting...");
    rl.close();
    return;
  }

  // Start the chat loop
  chatLoop();
}

/**
 * Chat interaction loop
 */
function chatLoop() {
  rl.question(
    '\nYou (type "exit" to quit, "history" to see chat history): ',
    async (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("Exiting chat test...");
        rl.close();
        return;
      }

      if (input.toLowerCase() === "history") {
        await getChatHistory();
        chatLoop();
        return;
      }

      await sendMessage(input);
      chatLoop();
    }
  );
}

// Start the test
startChatTest();
