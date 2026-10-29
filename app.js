const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const sendButton = document.getElementById("sendButton");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const sidebar = document.getElementById("sidebar");

function showModal(title, html) {
  modalTitle.textContent = title;
  modalContent.innerHTML = html;
  modalBackdrop.hidden = false;
  document.getElementById("modalOk").focus();
}
function closeModal() {
  modalBackdrop.hidden = true;
}
document.getElementById("privacyButton").addEventListener("click", () => showModal("Privacy & safety", `
  <p><strong>This is an early prototype.</strong> The chat currently runs in demo mode. Your messages are handled in this browser and are not sent to an AI service by this prototype.</p>
  <ul>
    <li>Do not enter passwords, financial details, or information you would not want exposed.</li>
    <li>This prototype does not save chat history to an account or a server. Refreshing the page clears the conversation.</li>
    <li>When a real AI service is connected, the site must explain what data is sent, who processes it, and how it is retained.</li>
    <li>Unjudged is not therapy or an emergency service.</li>
  </ul>
  <p>If you may act on thoughts of harming yourself or someone else, contact local emergency services or a trusted person who can stay with you now.</p>
`));
document.getElementById("aboutButton").addEventListener("click", () => showModal("About Unjudged", `
  <p><strong>Unjudged — You can say it here.</strong></p>
  <p>Unjudged is being designed as a supportive place for adults to talk about loneliness, relationships, and personal struggles without being shamed.</p>
  <p>The goal is to listen first, respond with care, and help people explore their options at their own pace.</p>
  <p>This version is a visual prototype with sample responses. It is not yet connected to a live AI model.</p>
`));
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalOk").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", e => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function addMessage(role, text) {
  welcome.hidden = true;
  const wrap = document.createElement("div");
  wrap.className = `message ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "assistant" ? "♡" : "•";
  const body = document.createElement("div");
  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = role === "assistant" ? "UNJUDGED · DEMO" : "YOU";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  body.append(label, bubble);
  wrap.append(avatar, body);
  messages.appendChild(wrap);
  wrap.scrollIntoView({ behavior: "smooth", block: "end" });
}

function getDemoReply(message) {
  const s = message.toLowerCase();
  const crisis = /(kill myself|suicid|end my life|hurt myself|self.harm|don't want to live|do not want to live|hurt someone|kill someone)/i.test(s);
  if (crisis) {
    return "I'm really sorry things feel this painful, and I'm glad you told me. I want to take what you're saying seriously. Are you in immediate danger right now, or do you feel you might act on these thoughts soon? If you can, please contact local emergency services or reach out to someone you trust who can be with you right now. This demo can't provide emergency help, but you deserve real support in this moment.";
  }
  if (/(lonely|alone|isolat|no friends|nobody cares|no one cares)/i.test(s)) {
    return "That sounds lonely to carry, especially if you've been sitting with it for a while. You don't have to make it sound smaller than it feels. When does that loneliness tend to hit hardest for you?";
  }
  if (/(relationship|partner|boyfriend|girlfriend|husband|wife|break.?up|cheat|trust|dating|love)/i.test(s)) {
    return "Relationships can bring up a lot at once, and it can be hard to know what to do with all those feelings. I won't jump to conclusions about you or the other person. What part of this has been weighing on you the most?";
  }
  if (/(ashamed|shame|guilt|guilty|confess|terrible person|bad person|embarrass|regret)/i.test(s)) {
    return "It can take courage to say something you're ashamed of. I won't shame you here, and we can look at what happened honestly without reducing you to one moment or one choice. What feels hardest to admit or make sense of right now?";
  }
  if (/(anxious|anxiety|overwhelm|stressed|panic|afraid|scared|worried)/i.test(s)) {
    return "It sounds like a lot is happening inside right now. We don't have to solve everything at once. Would it help to tell me what's making this feel most overwhelming, or would you rather pause and take one slow breath first?";
  }
  if (/(don't need advice|do not need advice|just listen|just need to talk|let it out|vent)/i.test(s)) {
    return "Of course. I can stay with you in the conversation without jumping into advice. You don't have to organize your thoughts or reach a conclusion. What's been sitting on your heart?";
  }
  if (/(thank you|thanks|helped|feel better)/i.test(s)) {
    return "I'm glad you told me. You don't have to figure everything out in one conversation. Is there anything else you want to get off your chest, or would you like to sit with what you've shared for a moment?";
  }
  return "Thank you for trusting this space with that. I want to understand rather than assume what it means for you. What has this been feeling like from your side?";
}

function sendMessage(text) {
  const clean = text.trim();
  if (!clean) return;
  addMessage("user", clean);
  input.value = "";
  resizeInput();
  sendButton.disabled = true;
  window.setTimeout(() => {
    addMessage("assistant", getDemoReply(clean));
    sendButton.disabled = false;
    input.focus();
  }, 450);
}
form.addEventListener("submit", e => {
  e.preventDefault();
  sendMessage(input.value);
});
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});
function resizeInput() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 140) + "px";
}
input.addEventListener("input", resizeInput);
document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt));
});
document.getElementById("newChat").addEventListener("click", () => {
  messages.replaceChildren();
  welcome.hidden = false;
  input.value = "";
  resizeInput();
  input.focus();
  sidebar.classList.remove("open");
});
document.getElementById("clearChat").addEventListener("click", () => {
  messages.replaceChildren();
  welcome.hidden = false;
});
document.getElementById("mobileMenu").addEventListener("click", () => sidebar.classList.toggle("open"));
document.addEventListener("click", e => {
  if (window.innerWidth <= 760 && sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) && !e.target.closest("#mobileMenu")) {
    sidebar.classList.remove("open");
  }
});
