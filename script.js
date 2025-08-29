const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Conversation Library (Hindi + English)
const responses = {
  "hello": "hi 👋",
  "hi": "hello there 😊",
  "hey": "Hey! How’s it going?",
  "good morning": "🌞 Good morning! Have a great day!",
  "good night": "🌙 Good night! Sweet dreams!",
  "how are you": "I'm fine, thanks! How are you?",
  "i am fine": "That's great to hear 😃",

  "नमस्ते": "🙏 आपका स्वागत है",
  "नमस्कार": "🙏 नमस्कार, कैसे हैं आप?",
  "शुभ प्रभात": "🌞 शुभ प्रभात! आपका दिन मंगलमय हो",
  "शुभ रात्रि": "🌙 शुभ रात्रि! अच्छे सपने देखें",
  "आप कैसे हैं": "मैं बिलकुल ठीक हूँ 😊, आप कैसे हैं?",
  "मैं ठीक हूँ": "बहुत अच्छा 👍",

  "धन्यवाद": "🙏 आपका भी धन्यवाद",
  "thanks": "You're welcome! 😊",
  "thank you": "Anytime! Glad to help 🤗",

  "what is your name": "I am Shiv's AI Chatbot 🤖",
  "तुम्हारा नाम क्या है": "मेरा नाम शिव का AI चैटबॉट है 🤖",
  "who made you": "I was created by Shiv 🧑‍💻",
  "तुम्हें किसने बनाया": "मुझे शिव ने बनाया 🧑‍💻"
};

// AI Response Function (Keyword-based)
function getBotResponse(userText) {
  const text = userText.toLowerCase().trim();

  // अगर exact sentence match मिलता है
  if (responses[text]) {
    return responses[text];
  }

  // Default reply
  return "I am Shiv's AI Chatbot 🤖, you said: " + userText;
}

function addMessage(message, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender === "user" ? "user-msg" : "bot-msg");
  msgDiv.textContent = message;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", () => {
  const userText = userInput.value.trim();
  if (userText === "") return;

  addMessage(userText, "user");
  userInput.value = "";

  setTimeout(() => {
    const botResponse = getBotResponse(userText);
    addMessage(botResponse, "bot");
  }, 500);
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});
