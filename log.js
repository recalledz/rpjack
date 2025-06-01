
function addLog(message, type = "default") {
  const logContainer = document.getElementById("game-log");
  const entry = document.createElement("div");

  const colorMap = {
    default: "#eee",
    damage: "#f88",
    heal: "#8f8",
    info: "#88f",
    level: "#ffa500"
  };

  entry.textContent = message;
  entry.style.color = colorMap[type] || "#eee";
  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

export default addLog; 