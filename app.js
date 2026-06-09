/* ==========================================================================
   session dept. - Application Logic
   Aesthetic: Smooth transitions, interactive states, e-commerce, custom cursor
   ========================================================================== */

// --- Global State ---
let cart = [];
const PRODUCTS = {
    1: { id: 1, name: "Classic Green Ashtray", price: 2499.00, img: "assets/images/ashtray_horizontal.jpg" },
    2: { id: 2, name: "Sessions Rolling Papers (3-Pack)", price: 599.00, img: "assets/images/papers_vertical.jpg" },
    3: { id: 3, name: "Glass Session Bong", price: 8999.00, img: "assets/images/bong_vertical.jpg" },
    4: { id: 4, name: "Session Dept. Merch Tee & Sticker Pack", price: 3499.00, img: "assets/images/tshirt_back.jpg" },
    5: { id: 5, name: "The Welcome Box Bundle", price: 4999.00, img: "assets/images/welcome_box.jpg" }
};

// Builder configuration selection
const builderConfig = {
    paper: { val: "organic", name: "Organic Hemp Papers", price: 0.00 },
    ashtray: { val: "classic", name: "Classic Ceramic Green Ashtray", price: 0.00 },
    sound: { val: "lofi", name: "Chill Lo-fi Playlist" }
};
const BUILDER_BASE_PRICE = 1999.00;

// Soundtrack URLs mapping
const PLAYLISTS = {
    lofi: { title: "lo-fi sessions vol. 1", desc: "lo-fi chill beats", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
    techno: { title: "techno session vol. 3", desc: "deep melodic techno", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    ambient: { title: "ambient vinyl sessions", desc: "relaxing crackle ambient", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
};

// --- Safe Storage Helpers (prevents SecurityError in sandboxes or local files) ---
function safeGetLocal(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        // Read from cookies as fallback
        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
        return match ? match[2] : null;
    }
}

function safeSetLocal(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        // Write to cookies as fallback
        document.cookie = `${key}=${value}; max-age=86400; path=/`;
    }
}

function safeGetSession(key) {
    try {
        return sessionStorage.getItem(key);
    } catch (e) {
        // In-memory fallback for sandbox session persistence
        return window[`__session_${key}`] || null;
    }
}

function safeSetSession(key, value) {
    try {
        sessionStorage.setItem(key, value);
    } catch (e) {
        // In-memory fallback
        window[`__session_${key}`] = value;
    }
}

// --- DOM Loaded Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    initAgeGate();
    initCustomCursor();
    initCartSystem();
    initSessionBuilder();
    initAmbientPlayer();
    initProductFilters();
    initScrollReveal();
    initNewsletterForm();
    initMobileNav();

    // Defer Chat Widget initialization until user interaction or a 10s timeout
    let chatLoaded = false;
    function loadChatWidget() {
        if (chatLoaded) return;
        chatLoaded = true;
        initChatWidget();
        
        // Cleanup event listeners
        window.removeEventListener("scroll", loadChatWidget);
        window.removeEventListener("click", loadChatWidget);
        window.removeEventListener("touchstart", loadChatWidget);
        window.removeEventListener("mousemove", loadChatWidget);
    }
    
    window.addEventListener("scroll", loadChatWidget, { passive: true });
    window.addEventListener("click", loadChatWidget, { passive: true });
    window.addEventListener("touchstart", loadChatWidget, { passive: true });
    window.addEventListener("mousemove", loadChatWidget, { passive: true });
    setTimeout(loadChatWidget, 10000);
});

// ==========================================================================
// 1. Compliance Age Gate
// ==========================================================================
function initAgeGate() {
    const ageGate = document.getElementById("age-gate-dialog");
    const confirmBtn = document.getElementById("btn-confirm-age");
    const rejectBtn = document.getElementById("btn-reject-age");
    const card = document.getElementById("age-gate-card");

    if (!ageGate) return;

    // Check if verified already using safe localStorage check
    const isVerified = safeGetLocal("age-verified") === "true";

    if (!isVerified) {
        // Display age-gate immediately (non-closable by escape)
        document.body.classList.add("age-gate-active");
        ageGate.showModal();
        ageGate.addEventListener("cancel", (e) => e.preventDefault());
        document.body.style.overflow = "hidden"; // Lock page scroll
    }

    confirmBtn.addEventListener("click", () => {
        // Verification success
        safeSetLocal("age-verified", "true");
        
        // Custom exit animation before closing
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        
        setTimeout(() => {
            ageGate.close();
            document.body.style.overflow = ""; // Enable scrolling
            document.body.classList.remove("age-gate-active");
        }, 300);
    });

    rejectBtn.addEventListener("click", () => {
        // Add visual feedback (shake)
        card.classList.add("shake");
        setTimeout(() => card.classList.remove("shake"), 500);

        // Redirect to safe compliance location
        setTimeout(() => {
            window.location.href = "https://www.google.com";
        }, 600);
    });
}

// ==========================================================================
// 2. Custom Pointer Cursor
// ==========================================================================
function initCustomCursor() {
    const cursor = document.getElementById("custom-cursor");
    const ring = document.getElementById("custom-cursor-ring");

    if (!cursor || !ring) return;

    let mouseX = 0, mouseY = 0; // Mouse coords
    let ringX = 0, ringY = 0;   // Lag ring coords

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursor.style.left = mouseX + "px";
        cursor.style.top = mouseY + "px";
    });

    // Lag effect loop using requestAnimationFrame
    function animateRing() {
        // Calculate difference
        const dx = mouseX - ringX;
        const dy = mouseY - ringY;

        // Apply friction/interpolation
        ringX += dx * 0.15;
        ringY += dy * 0.15;

        ring.style.left = ringX + "px";
        ring.style.top = ringY + "px";

        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover listeners to resize cursor
    const hoverTargets = "a, button, input, select, textarea, .option-card, .btn-add-cart, .logo-link";
    
    function addHoverEvents() {
        document.querySelectorAll(hoverTargets).forEach(el => {
            // Avoid duplicate listeners
            if (el.dataset.hasCursorEvents === "true") return;
            
            el.addEventListener("mouseenter", () => {
                cursor.classList.add("hovered");
                ring.classList.add("hovered");
            });
            el.addEventListener("mouseleave", () => {
                cursor.classList.remove("hovered");
                ring.classList.remove("hovered");
            });
            
            el.dataset.hasCursorEvents = "true";
        });
    }

    addHoverEvents();
    
    // Periodically re-apply in case dynamic elements are generated (like inside the cart)
    setInterval(addHoverEvents, 1000);
}

// ==========================================================================
// 3. E-Commerce Cart Drawer System
// ==========================================================================
function initCartSystem() {
    const cartToggle = document.getElementById("cart-toggle-btn");
    const closeCart = document.getElementById("btn-close-cart");
    const cartOverlay = document.getElementById("cart-drawer-overlay");
    const cartDrawer = document.getElementById("cart-drawer");
    const checkoutBtn = document.getElementById("btn-checkout");
    const checkoutDialog = document.getElementById("checkout-dialog");
    const closeCheckoutBtn = document.getElementById("btn-close-checkout");

    if (!cartDrawer) return;

    // Load cart from sessionStorage if available using safe helper
    const savedCart = safeGetSession("session-cart");
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    // Toggle drawer actions
    cartToggle.addEventListener("click", () => openCartDrawer());
    closeCart.addEventListener("click", () => closeCartDrawer());
    cartOverlay.addEventListener("click", () => closeCartDrawer());

    // Checkout process
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty! Add some items before session check-out.");
            return;
        }

        // Complete Checkout
        checkoutDialog.showModal();
        
        // Reset Cart state
        cart = [];
        try {
            sessionStorage.removeItem("session-cart");
        } catch (e) {
            delete window["__session_session-cart"];
        }
        updateCartUI();
        closeCartDrawer();
    });

    closeCheckoutBtn.addEventListener("click", () => {
        checkoutDialog.close();
    });
}

function openCartDrawer() {
    document.getElementById("cart-drawer").classList.add("open");
    document.getElementById("cart-drawer-overlay").classList.add("open");
}

function closeCartDrawer() {
    document.getElementById("cart-drawer").classList.remove("open");
    document.getElementById("cart-drawer-overlay").classList.remove("open");
}

// Expose globally so inline onclick handlers work
window.addToCart = function(productId) {
    const p = PRODUCTS[productId];
    if (!p) return;

    // Search if item exists
    const existing = cart.find(item => item.id === productId && !item.isCustom);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: p.id,
            name: p.name,
            price: p.price,
            img: p.img,
            quantity: 1,
            isCustom: false
        });
    }

    saveAndUpdateCart();
    openCartDrawer();
};

function saveAndUpdateCart() {
    safeSetSession("session-cart", JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById("cart-items-list");
    const countBadge = document.getElementById("cart-count");
    const totalEl = document.getElementById("cart-total-price");

    if (!list) return;

    // Cart counts
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countBadge.innerText = totalItems;

    // Empty template
    if (cart.length === 0) {
        list.innerHTML = `<p class="cart-empty-message">Your cart is currently empty. Get ready for the session.</p>`;
        totalEl.innerText = "₹0.00";
        return;
    }

    let listHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        listHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.img}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <span class="cart-item-meta">${item.isCustom ? 'Custom Pack' : 'Standard Item'}</span>
                    <div class="cart-item-controls">
                        <div class="quantity-controller">
                            <button class="qty-btn" onclick="updateQty(${index}, -1)" title="Decrease Quantity">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQty(${index}, 1)" title="Increase Quantity">+</button>
                        </div>
                        <span class="cart-item-price">₹${itemTotal.toFixed(2)}</span>
                    </div>
                    <button class="btn-remove-item" onclick="removeCartItem(${index})" style="align-self: flex-start; margin-top: 8px;">remove</button>
                </div>
            </div>
        `;
    });

    list.innerHTML = listHTML;
    totalEl.innerText = `₹${subtotal.toFixed(2)}`;
}

window.updateQty = function(index, delta) {
    if (index < 0 || index >= cart.length) return;
    
    cart[index].quantity += delta;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveAndUpdateCart();
};

window.removeCartItem = function(index) {
    if (index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    saveAndUpdateCart();
};

// ==========================================================================
// 4. Interactive Session Builder Widget
// ==========================================================================
function initSessionBuilder() {
    const optionCards = document.querySelectorAll(".option-card");
    const addBuilderBtn = document.getElementById("btn-add-builder-to-cart");

    if (optionCards.length === 0) return;

    optionCards.forEach(card => {
        card.addEventListener("click", () => {
            const step = card.dataset.step;
            const value = card.dataset.val;
            const price = parseFloat(card.dataset.price || 0);
            const label = card.dataset.label;

            // Highlight selected in current step
            document.querySelectorAll(`.option-card[data-step="${step}"]`).forEach(c => {
                c.classList.remove("selected");
            });
            card.classList.add("selected");

            // Save choice
            if (step === "1") {
                builderConfig.paper = { val: value, name: label, price: price };
            } else if (step === "2") {
                builderConfig.ashtray = { val: value, name: label, price: price };
            } else if (step === "3") {
                builderConfig.sound = { val: value, name: label };
                // Dynamic audio playlist sync!
                syncPlaylistWithBuilder(value);
            }

            updateBuilderReceipt();
        });
    });

    addBuilderBtn.addEventListener("click", () => {
        const subtotal = BUILDER_BASE_PRICE + builderConfig.paper.price + builderConfig.ashtray.price;
        const name = `Session Vibe Box (${builderConfig.paper.val.toUpperCase()} + ${builderConfig.ashtray.val.toUpperCase()})`;
        
        // Add customized product
        cart.push({
            id: `custom-box-${Date.now()}`,
            name: name,
            price: subtotal,
            img: "assets/images/welcome_box.jpg", // Representing the custom box bundle
            quantity: 1,
            isCustom: true
        });

        saveAndUpdateCart();
        openCartDrawer();
    });
}

function updateBuilderReceipt() {
    const paperLabel = document.getElementById("preview-paper-label");
    const paperPrice = document.getElementById("preview-paper-price");
    
    const ashtrayLabel = document.getElementById("preview-ashtray-label");
    const ashtrayPrice = document.getElementById("preview-ashtray-price");
    
    const soundLabel = document.getElementById("preview-sound-label");
    const totalEl = document.getElementById("builder-total-price");

    if (!paperLabel) return;

    paperLabel.innerText = builderConfig.paper.name;
    paperPrice.innerText = builderConfig.paper.price === 0 ? "+₹0.00" : `+₹${builderConfig.paper.price.toFixed(2)}`;

    ashtrayLabel.innerText = builderConfig.ashtray.name;
    ashtrayPrice.innerText = builderConfig.ashtray.price === 0 ? "+₹0.00" : `+₹${builderConfig.ashtray.price.toFixed(2)}`;

    soundLabel.innerText = builderConfig.sound.name;

    const total = BUILDER_BASE_PRICE + builderConfig.paper.price + builderConfig.ashtray.price;
    totalEl.innerText = `₹${total.toFixed(2)}`;
}

// ==========================================================================
// 5. Ambient Sound Player Functionality
// ==========================================================================
function initAmbientPlayer() {
    const audio = document.getElementById("ambient-audio");
    const toggleBtn = document.getElementById("player-toggle-btn");
    const headerToggleBtn = document.getElementById("playlist-toggle-btn");
    const btnIcon = document.getElementById("player-btn-icon");
    const vinyl = document.getElementById("vinyl-disc");
    const visualizerBars = document.querySelectorAll(".visualizer-bar");
    const playerCapsule = document.getElementById("floating-audio-player");

    if (!audio || !toggleBtn) return;

    // Keep floating capsule hidden slightly after loading, then show
    setTimeout(() => {
        playerCapsule.classList.remove("hidden");
    }, 1500);

    // Sync toggles
    toggleBtn.addEventListener("click", () => toggleAudioPlayback());
    headerToggleBtn.addEventListener("click", () => toggleAudioPlayback());

    // Expand/Collapse Floating Audio Player on mobile
    const playerVinyl = playerCapsule.querySelector(".player-vinyl-wrapper");
    if (playerVinyl) {
        playerVinyl.addEventListener("click", (e) => {
            if (window.innerWidth < 768) {
                e.stopPropagation();
                playerCapsule.classList.toggle("expanded");
            }
        });
    }

    // Collapse player on click outside
    document.addEventListener("click", (e) => {
        if (window.innerWidth < 768 && playerCapsule.classList.contains("expanded") && !playerCapsule.contains(e.target)) {
            playerCapsule.classList.remove("expanded");
        }
    });

    function toggleAudioPlayback() {
        if (audio.paused) {
            audio.play().then(() => {
                btnIcon.className = "fa-solid fa-pause";
                vinyl.classList.add("playing");
                visualizerBars.forEach(bar => bar.classList.add("playing"));
                headerToggleBtn.classList.add("hovered");
            }).catch(err => {
                console.log("Audio play blocked by browser. Wait for user interaction.", err);
            });
        } else {
            audio.pause();
            btnIcon.className = "fa-solid fa-play";
            vinyl.classList.remove("playing");
            visualizerBars.forEach(bar => bar.classList.remove("playing"));
            headerToggleBtn.classList.remove("hovered");
        }
    }
}

function syncPlaylistWithBuilder(soundType) {
    const audio = document.getElementById("ambient-audio");
    const titleEl = document.getElementById("player-track-title");
    const descEl = document.getElementById("player-track-desc");
    const playlist = PLAYLISTS[soundType];

    if (!audio || !playlist) return;

    const wasPlaying = !audio.paused;

    // Load new audio source
    audio.src = playlist.src;
    titleEl.innerText = playlist.title;
    descEl.innerText = playlist.desc;

    // Replay if it was previously playing
    if (wasPlaying) {
        audio.play().catch(e => console.log("Sound sync replay block: ", e));
    }
}

// ==========================================================================
// 6. Product Category Filtering Layout
// ==========================================================================
function initProductFilters() {
    const filters = document.querySelectorAll(".filter-btn");
    
    if (filters.length === 0) return;

    filters.forEach(btn => {
        btn.addEventListener("click", () => {
            // Toggle active category
            filters.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const category = btn.dataset.category;
            const cards = document.querySelectorAll(".product-card");

            cards.forEach(card => {
                const cardCat = card.dataset.category;
                
                if (category === "all" || cardCat === category) {
                    card.style.display = "flex";
                    // Brief timeout for animation scale opacity
                    setTimeout(() => {
                        card.style.opacity = "1";
                        card.style.transform = "scale(1)";
                    }, 50);
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.95)";
                    setTimeout(() => {
                        card.style.display = "none";
                    }, 300);
                }
            });
        });
    });
}

// ==========================================================================
// 7. Scroll-driven Reveals (Intersection Observer)
// ==========================================================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal-on-scroll");

    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                // Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12, // Element is 12% visible
        rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
}

// ==========================================================================
// 8. Newsletter Email Submit Handler
// ==========================================================================
function initNewsletterForm() {
    const form = document.getElementById("newsletter-form");
    const feedback = document.getElementById("newsletter-feedback");

    if (!form || !feedback) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const input = form.querySelector(".newsletter-input");
        const emailVal = input.value.trim();

        if (emailVal === "") return;

        // Perform mock email sign-up validation
        feedback.innerText = "SUCCESS! You've joined the session.";
        feedback.className = "newsletter-feedback success";
        input.value = "";

        setTimeout(() => {
            feedback.style.opacity = "0";
            setTimeout(() => {
                feedback.innerText = "";
                feedback.className = "newsletter-feedback";
                feedback.style.opacity = "1";
            }, 500);
        }, 4000);
    });
}

// ==========================================================================
// 9. Live Auto Chat Widget (Tawk.to Inspired)
// ==========================================================================
function initChatWidget() {
    const bubble = document.getElementById("chat-bubble");
    const windowEl = document.getElementById("chat-window");
    const minimizeBtn = document.getElementById("chat-minimize-btn");
    const messagesArea = document.getElementById("chat-messages-area");
    const form = document.getElementById("chat-input-form");
    const userInput = document.getElementById("chat-user-input");
    const badge = document.getElementById("chat-badge");

    if (!bubble || !windowEl) return;

    let welcomeSent = false;
    let chatOpenedOnce = false;

    // Toggle Chat visibility
    bubble.addEventListener("click", () => {
        windowEl.classList.toggle("open");
        if (windowEl.classList.contains("open")) {
            // Clear badge count
            badge.style.opacity = "0";
            setTimeout(() => badge.style.display = "none", 300);
            
            // Scroll messages to bottom
            setTimeout(() => {
                messagesArea.scrollTop = messagesArea.scrollHeight;
            }, 100);

            // If we open and welcome hasn't been sent yet, trigger it immediately
            if (!welcomeSent) {
                sendWelcomeMessage();
            }
            chatOpenedOnce = true;
        }
    });

    minimizeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        windowEl.classList.remove("open");
    });

    // Auto-Greeting after 4 seconds of browsing
    setTimeout(() => {
        if (!welcomeSent && !chatOpenedOnce) {
            sendWelcomeMessage();
            // Animate bubble slightly to draw attention
            bubble.style.transform = "scale(1.15) rotate(-5deg)";
            setTimeout(() => {
                bubble.style.transform = "";
            }, 400);
        }
    }, 4000);

    function sendWelcomeMessage() {
        welcomeSent = true;
        appendChatMessage("agent", "Yo! Welcome to session dept. 🌿 Need help picking papers or setting up your custom box? Ask me about shipping, bongs, papers, or builder details!");
        playChatChime();
    }

    // Handle User input submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (text === "") return;

        // Append user bubble
        appendChatMessage("user", text);
        userInput.value = "";

        // Display simulated typing indicator
        showTypingIndicator();

        // Bot response delay
        setTimeout(() => {
            hideTypingIndicator();
            const botReply = getAutoResponse(text);
            appendChatMessage("agent", botReply);
            playChatChime();
        }, 1200);
    });

    function appendChatMessage(sender, text) {
        const wrap = document.createElement("div");
        wrap.className = `chat-msg-wrap ${sender}`;

        const bubbleDiv = document.createElement("div");
        bubbleDiv.className = "chat-msg-bubble";
        bubbleDiv.innerText = text;

        const timeSpan = document.createElement("span");
        timeSpan.className = "chat-msg-time";
        
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, "0");
        const mins = String(now.getMinutes()).padStart(2, "0");
        timeSpan.innerText = `${hrs}:${mins}`;

        wrap.appendChild(bubbleDiv);
        wrap.appendChild(timeSpan);
        messagesArea.appendChild(wrap);

        // Smooth scroll to bottom
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    let typingIndicatorEl = null;

    function showTypingIndicator() {
        if (typingIndicatorEl) return;

        const indicator = document.createElement("div");
        indicator.className = "chat-typing-indicator";
        indicator.id = "chat-typing-indicator";
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesArea.appendChild(indicator);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        typingIndicatorEl = indicator;
    }

    function hideTypingIndicator() {
        if (typingIndicatorEl) {
            typingIndicatorEl.remove();
            typingIndicatorEl = null;
        }
    }

    // Friendly Gen-Z auto responses
    function getAutoResponse(query) {
        const text = query.toLowerCase();
        
        if (text.includes("hi") || text.includes("hello") || text.includes("hey") || text.includes("yo")) {
            return "Yo! Hope you're staying in session. What can I help you find today? 🌿";
        }
        if (text.includes("shipping") || text.includes("deliver") || text.includes("ship") || text.includes("india")) {
            return "We ship all across India for free! 🇮🇳 Standard delivery takes 3 to 5 business days, fully tracked.";
        }
        if (text.includes("papers") || text.includes("paper") || text.includes("rolling")) {
            return "Our papers are made from organic unrefined hemp with natural gum, burning slow and clean. You can add them in our Session Builder!";
        }
        if (text.includes("bong") || text.includes("bongs") || text.includes("glass")) {
            return "The session bong is made of heavy 5mm borosilicate glass, designed to look sleek on your table and hit super smooth. Limited stock! 🏺";
        }
        if (text.includes("ashtray") || text.includes("ashtrays")) {
            return "Our ashtray is premium heavy ceramic with a deep green glaze, designed to hold your joints stably. We also have a topdown glass version!";
        }
        if (text.includes("builder") || text.includes("vibe") || text.includes("custom")) {
            return "The Session Builder lets you customize your papers, ashtray, and lo-fi playlist, packing it all in a welcome box for ₹1,999.00. Check it out! 📦";
        }
        if (text.includes("phone") || text.includes("contact") || text.includes("support") || text.includes("number")) {
            return "You can shoot us a text or call at +91 9102395579, or email sessions@sessiondept.com. We're online 24/7. 📱";
        }
        if (text.includes("price") || text.includes("cost") || text.includes("rupees") || text.includes("rs")) {
            return "Prices are in Indian Rupees (₹). Ashtrays are ₹2,499.00, papers are ₹599.00, and bongs are ₹8,999.00. Standard bundles start at ₹1,999.00!";
        }
        
        return "Stay in session! Type 'shipping', 'bong', 'papers', 'phone', or 'builder' to get quick details, or ask a question.";
    }

    // Audio chime generator using Web Audio API (friendly sine wave beep)
    function playChatChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.12); // A5
            
            gain.gain.setValueAtTime(0.04, ctx.currentTime); // Low volume
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) {
            console.log("AudioContext blocked or not supported", e);
        }
    }
}

// ==========================================================================
// 10. Mobile Navigation Toggle Menu
// ==========================================================================
function initMobileNav() {
    const toggleBtn = document.getElementById("mobile-nav-toggle");
    const mainNav = document.getElementById("main-nav");
    
    if (!toggleBtn || !mainNav) return;
    
    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", !expanded);
        mainNav.classList.toggle("open");
        
        // Lock body scrolling when mobile menu is active
        if (!expanded) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    });
    
    // Close menu when clicking outside of the nav area
    document.addEventListener("click", (e) => {
        if (mainNav.classList.contains("open") && !mainNav.contains(e.target) && e.target !== toggleBtn) {
            toggleBtn.setAttribute("aria-expanded", "false");
            mainNav.classList.remove("open");
            document.body.style.overflow = "";
        }
    });
    
    // Close mobile menu on clicking any navigation links
    mainNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            toggleBtn.setAttribute("aria-expanded", "false");
            mainNav.classList.remove("open");
            document.body.style.overflow = "";
        });
    });
}


