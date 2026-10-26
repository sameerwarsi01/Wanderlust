document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.getElementById("chatBox");
    if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    const chatContext = document.getElementById("chatContext");
    if (!chatContext) return;

    const conversationId = chatContext.dataset.conversationId;
    const currentUserId = chatContext.dataset.currentUserId;

    if (!conversationId || typeof io === "undefined") return;

    const socket = io();

    // 1. Join Chat Room
    socket.emit("join-chat", conversationId);

    // 2. Handle Message Form Submission
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");

    if (chatForm && chatInput) {
        chatForm.onsubmit = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const text = chatInput.value.trim();
            if (!text) return false;

            chatInput.value = "";

            try {
                const response = await fetch(chatForm.action, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({ text }),
                });

                const data = await response.json();
                if (data.success) {
                    socket.emit("send-message", {
                        conversationId: conversationId,
                        text: data.message.text,
                        senderId: currentUserId,
                        createdAt: data.message.createdAt,
                    });
                }
            } catch (err) {
                console.error("Message send failed:", err);
            }
            return false;
        };
    }

    // 3. Receive Real-Time Message Listener
    socket.on("receive-message", (data) => {
        if (data.conversationId !== conversationId) return;

        const isMe = String(data.senderId).trim() === String(currentUserId).trim();
        const timeString = new Date(data.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        const msgDiv = document.createElement("div");
        msgDiv.className = `d-flex flex-column ${isMe ? "align-items-end" : "align-items-start"}`;
        msgDiv.innerHTML = `
            <div class="px-3 py-2 rounded-4 ${isMe ? "bg-danger text-white" : "bg-white text-dark border"}" 
                 style="max-width: 75%; word-break: break-word;">
                ${data.text}
            </div>
            <small class="text-muted px-1" style="font-size: 0.7rem;">
                ${timeString}
            </small>
        `;

        const placeholder = chatBox.querySelector(".empty-chat-placeholder");
        if (placeholder) {
            placeholder.remove();
        }

        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Left sidebar update
        const activeTab = document.getElementById(`conv-tab-${conversationId}`);
        if (activeTab) {
            const preview = activeTab.querySelector(".conv-last-msg");
            const timeElem = activeTab.querySelector(".conv-time");
            if (preview) preview.textContent = data.text;
            if (timeElem) timeElem.textContent = timeString;
        }
    });
});