const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const historyButton = document.getElementById("historyButton");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");

function addMessage(text, sender) {
  welcome.classList.add("hidden");

  const element = document.createElement("div");
  element.className = `message ${sender}`;

  // textContent prevents user text from being interpreted as HTML.
  element.textContent = text;

  messages.appendChild(element);

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });

  return element;
}

async function sendMessage(message) {
  const question = message.trim();

  if (!question || sendButton.disabled) {
    return;
  }

  addMessage(question, "user");
  input.value = "";
  sendButton.disabled = true;
  sendButton.textContent = "रुकिए...";

  const loading = addMessage("जवाब तैयार हो रहा है...", "bot");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: question
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "कुछ समस्या हुई।");
    }

    loading.textContent = data.answer;
  } catch (error) {
    loading.textContent =
      "माफ कीजिए, जवाब नहीं मिल सका। " + error.message;
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "भेजें ↑";
    input.focus();
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(input.value);
});

document.querySelectorAll("[data-question]").forEach(button => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.question);
  });
});

historyButton.addEventListener("click", async () => {
  historyPanel.classList.toggle("hidden");

  if (historyPanel.classList.contains("hidden")) {
    return;
  }

  historyList.textContent = "इतिहास लोड हो रहा है...";

  try {
    const response = await fetch("/api/history");

    if (!response.ok) {
      throw new Error("इतिहास लोड नहीं हुआ।");
    }

    const items = await response.json();
    historyList.replaceChildren();

    if (items.length === 0) {
      historyList.textContent = "अभी कोई बातचीत सेव नहीं है।";
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "history-item";

      const question = document.createElement("p");
      question.textContent = "आप: " + item.question;

      const answer = document.createElement("p");
      answer.textContent = "Vinay Bot: " + item.answer;

      card.append(question, answer);
      historyList.appendChild(card);
    });
  } catch (error) {
    historyList.textContent = error.message;
  }
});

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});￼Enter
