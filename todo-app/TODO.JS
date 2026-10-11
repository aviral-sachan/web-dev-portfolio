document.addEventListener("DOMContentLoaded", () => {
    const blurOverlay = document.getElementById("cinematic-blur-overlay");
    const mainWrapper = document.getElementById("app-viewport-wrapper");
    let generatedCaptchaText = "";
    let tasks = [];

    let pomodoroInterval = null;
    let isTimerRunning = false;
    let timeRemaining = 25 * 60;

    const dayMapping = {
        "day1": "Monday", "day2": "Tuesday", "day3": "Wednesday",
        "day4": "Thursday", "day5": "Friday", "day6": "Saturday", "day7": "Sunday"
    };

    const getStorageKeyForToday = () => {
        const nativeDay = new Date().getDay();
        return nativeDay === 0 ? "day7" : "day" + nativeDay;
    };
    const activeStorageKey = getStorageKeyForToday();

    const AUTH_TEMPLATE = `
        <div id="auth-panel" class="todo-container auth-box">
            <div class="auth-brand-side">
                <div style="font-size: 40px; margin-bottom: 10px;">🔥</div>
                <h2>Welcome Back!</h2>
                <p>To stay connected with us please login with your personal info</p>
            </div>
            
            <div class="auth-form-side">
                <div class="auth-tabs">
                    <button id="tab-login-btn" class="auth-tab active">Login</button>
                    <button id="tab-signup-btn" class="auth-tab">Register</button>
                </div>
                
                <form id="login-form" class="auth-form active">
                    <h2>Welcome</h2>
                    <div class="form-group"><input type="text" id="login-username" placeholder="Username" required autocomplete="off"></div>
                    <div class="form-group"><input type="password" id="login-password" placeholder="Password" required></div>
                    <button type="submit" class="auth-submit-btn">SIGN IN</button>
                </form>
                
                <form id="signup-form" class="auth-form">
                    <h2>Create Account</h2>
                    <div class="form-group"><input type="text" id="signup-name" placeholder="Full Name" required autocomplete="off"></div>
                    <div class="form-group"><label class="form-label">Date of Birth:</label><input type="date" id="signup-dob" required></div>
                    <div class="form-group"><label class="form-label">Username Preview:</label><input type="text" id="signup-username-preview" placeholder="Generated automatically..." disabled></div>
                    <div class="form-group"><input type="password" id="signup-password" placeholder="Create Password" required></div>
                    
                    <div class="captcha-wrapper">
                        <div id="captcha-display" class="captcha-box"></div>
                        <button type="button" id="captcha-refresh-btn" class="captcha-refresh">🔄</button>
                    </div>
                    <div class="form-group"><input type="text" id="signup-captcha-input" placeholder="Type Captcha" required autocomplete="off"></div>
                    <button type="submit" class="auth-submit-btn">REGISTER</button>
                </form>
            </div>
        </div>
    `;
    const MAIN_APP_TEMPLATE = `
        <div class="dashboard-fade-in width-100 flex-col">
            <nav class="navbar">
                <div class="nav-brand" style="font-weight: bold; font-size: 1.3rem;">🍃 TaskLeaf</div>
                <div class="nav-links">
                    <button id="theme-toggle-btn" class="theme-toggle">🌙 Dark Mode</button>
                    <div class="dropdown-wrapper">
                        <a href="#" class="nav-item" id="history-trigger">History ▾</a>
                        <ul class="dropdown-menu" id="history-dropdown">
                            <li><a href="#" class="dropdown-item" data-day="day1">Day 1 - Monday</a></li>
                            <li><a href="#" class="dropdown-item" data-day="day2">Day 2 - Tuesday</a></li>
                            <li><a href="#" class="dropdown-item" data-day="day3">Day 3 - Wednesday</a></li>
                            <li><a href="#" class="dropdown-item" data-day="day4">Day 4 - Thursday</a></li>
                            <li><a href="#" class="dropdown-item" data-day="day5">Day 5 - Friday</a></li>
                            <li><a href="#" class="dropdown-item" data-day="day6">Day 6 - Saturday</a></li>
                            <li><a href="#" class="dropdown-item" data-day="day7">Day 7 - Sunday</a></li>
                        </ul>
                    </div>
                    <a href="#" class="nav-item" id="contact-trigger">Contact</a>
                    <a href="#" class="nav-item" id="logout-btn" style="color: #ff5252;">Logout</a>
                </div>
            </nav>
            
            <div class="dashboard-container">
                <div class="left-panel flex-col" style="gap: 20px; width: 100%;">
                    <div class="card" id="pomodoro-section" style="border: 2px dashed #1b4d22; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <div style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #1b4d22; text-transform: uppercase;">Focus Interval</div>
                        <div id="timer-display" style="font-size: 38px; font-weight: 800; font-variant-numeric: tabular-nums; color: #1b4d22;">25:00</div>
                        <div id="timer-status" style="font-size: 13px; font-weight: 500; color: #333; margin-bottom: 2px;">Time to focus!</div>
                        <div class="flex-row gap-12" style="display: flex; gap: 10px; justify-content: center;">
                            <button id="timer-start-btn" style="padding: 8px 20px; border-radius: 20px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; background: #1b4d22; color: white;">Start</button>
                            <button id="timer-reset-btn" style="padding: 8px 20px; border-radius: 20px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; background: rgba(0,0,0,0.1); color: #1b4d22;">Reset</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 style="color: #1b4d22 !important; margin-bottom: 12px; font-size: 16px; font-weight: 700;">Add a new task...</h3>
                        <div class="input-section flex-col" style="gap: 12px; display: flex;">
                            <input type="text" id="task-input" placeholder="Write your task here..." autocomplete="off">
                            <div class="flex-row width-100 gap-12" style="display: flex; gap: 10px; align-items: center;">
                                <select id="task-priority" class="priority-select">
                                    <option value="low">🍃 Low Priority</option>
                                    <option value="medium">⚡ Medium Priority</option>
                                    <option value="high">🚨 High Priority</option>
                                </select>
                                <button id="add-btn" style="width: 44px; height: 44px; font-size: 20px;">+</button>
                            </div>
                        </div>
                        <button id="clear-all-btn" class="clear-all-action-btn">🧹 Clear Day's Tasks</button>
                    </div>
                </div>
                
                <div class="right-panel flex-col" style="width: 100%;">
                    <div class="card">
                        <h2 style="color: #1b4d22 !important; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid rgba(27, 77, 34, 0.15); padding-bottom: 6px;">Active Task Board</h2>
                        <ul id="task-list" class="container">
                        </ul>
                    </div>
                </div>
            </div>
            </div> 
            
        </div> 
        
        <div class="dev-credit">🍃 Developed by Aviral</div>
<div class="modal-overlay" id="contact-modal">
    <div class="modal-box" style="text-align: center;">
        <div class="modal-header">
            <h3 style="color:white;">📬 Let's Connect</h3>
            <button class="modal-close" id="contact-close-btn">&times;</button>
        </div>
        <div class="modal-body" style="padding: 10px 0;">
            <p style="color:#eee; margin-bottom: 20px; font-size: 15px;">Hey, I am Aviral! Let's connect on LinkedIn for any feedback or ideas.</p>
            <a href="https://linkedin.com" target="_blank" style="display: inline-block; padding: 10px 24px; background-color: #0077b5; color: white; text-decoration: none; font-weight: bold; border-radius: 25px; box-shadow: 0 4px 15px rgba(0,119,181,0.3); transition: transform 0.2s;">
                💼 Visit My LinkedIn Profile
            </a>
        </div>
    </div>
</div>


            <div class="modal-overlay" id="history-modal"><div class="modal-box"><div class="modal-header"><h3 id="modal-day-title" style="color:white;">Day X</h3><button class="modal-close" id="modal-close-btn">&times;</button></div><div class="modal-body"><ul id="modal-task-list"></ul></div></div></div>
            <div class="modal-overlay" id="contact-modal"><div class="modal-box"><div class="modal-header"><h3 style="color:white;">📬 Get In Touch</h3><button class="modal-close" id="contact-close-btn">&times;</button></div><div class="modal-body contact-layout"><p style="color:#eee;">Have some ideas or feedback? Let's connect!</p><div class="contact-links"><a href="https://github.com" target="_blank" class="contact-card">🐙 GitHub Profile</a><a href="https://linkedin.com" target="_blank" class="contact-card">💼 LinkedIn Network</a></div></div></div></div>
        </div>
    `;
    const loadAuthScreen = () => {
        document.body.classList.add("auth-view");
        if (blurOverlay) blurOverlay.className = "initial-blur";
        mainWrapper.innerHTML = AUTH_TEMPLATE;
        setupAuthEvents();
    };

    const triggerCinematicTransition = (userKey) => {
        const activeContainer = document.querySelector(".todo-container");
        if (activeContainer) activeContainer.classList.add("wind-exit");
        setTimeout(() => { if (blurOverlay) blurOverlay.className = "reveal-clear"; }, 400);
        setTimeout(() => { loadDashboardScreen(userKey); }, 1200);
    };

    const loadDashboardScreen = (userKey) => {
        document.body.classList.remove("auth-view");
        mainWrapper.innerHTML = MAIN_APP_TEMPLATE;

        const profileData = JSON.parse(localStorage.getItem("user-profile-" + userKey)) || {};
        const greetingHeader = document.getElementById("user-greeting");
        if (greetingHeader && profileData.name) {
            greetingHeader.textContent = "Welcome back, " + profileData.name + "! 🍃";
        }

        setupDashboardEvents(userKey);
        setupPomodoroTimer();

        const themeToggleBtn = document.getElementById("theme-toggle-btn");
        if (themeToggleBtn) {
            themeToggleBtn.textContent = document.body.classList.contains("dark-theme") ? "☀️ Light Mode" : "🌙 Dark Mode";
        }
    };

    const setupAuthEvents = () => {
        const tabLoginBtn = document.getElementById("tab-login-btn");
        const tabSignupBtn = document.getElementById("tab-signup-btn");
        const loginForm = document.getElementById("login-form");
        const signupForm = document.getElementById("signup-form");
        const signupName = document.getElementById("signup-name");
        const signupDob = document.getElementById("signup-dob");
        const signupUserPreview = document.getElementById("signup-username-preview");
        const signupPassword = document.getElementById("signup-password");
        const captchaDisplay = document.getElementById("captcha-display");
        const captchaRefreshBtn = document.getElementById("captcha-refresh-btn");
        const captchaInput = document.getElementById("signup-captcha-input");
        const brandHeadline = document.querySelector(".auth-brand-side h2");
        const brandText = document.querySelector(".auth-brand-side p");

        if (tabLoginBtn && tabSignupBtn && loginForm && signupForm) {
            loginForm.style.display = "flex";
            signupForm.style.display = "none";

            tabLoginBtn.addEventListener("click", (e) => {
                e.preventDefault();
                tabLoginBtn.classList.add("active");
                tabSignupBtn.classList.remove("active");
                loginForm.style.display = "flex";
                signupForm.style.display = "none";
                if (brandHeadline) brandHeadline.textContent = "Welcome Back!";
                if (brandText) brandText.textContent = "To stay connected with us please login with your personal info";
            });

            tabSignupBtn.addEventListener("click", (e) => {
                e.preventDefault();
                tabSignupBtn.classList.add("active");
                tabLoginBtn.classList.remove("active");
                signupForm.style.display = "flex";
                loginForm.style.display = "none";
                if (brandHeadline) brandHeadline.textContent = "Hello, Friend!";
                if (brandText) brandText.textContent = "Enter your personal details and start journey with us";
                generateCaptcha();
            });
        }

        const updateUsernamePreview = () => {
            if (!signupName || !signupDob || !signupUserPreview) return;
            const nameVal = signupName.value.trim().toLowerCase().replace(/\s+/g, '');
            const dobVal = signupDob.value;
            if (nameVal.length >= 3 && dobVal) {
                const yearPart = dobVal.split("-");
                signupUserPreview.value = nameVal.substring(0, 3) + yearPart[0];
            } else { signupUserPreview.value = ""; }
        };

        if (signupName && signupDob) {
            signupName.addEventListener("input", updateUsernamePreview);
            signupDob.addEventListener("input", updateUsernamePreview);
        }

        const generateCaptcha = () => {
            if (!captchaDisplay) return;
            const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
            generatedCaptchaText = "";
            for (let i = 0; i < 6; i++) generatedCaptchaText += charset.charAt(Math.floor(Math.random() * charset.length));
            captchaDisplay.textContent = generatedCaptchaText;
        };

        if (captchaRefreshBtn) captchaRefreshBtn.addEventListener("click", generateCaptcha);

        if (signupForm) {
            signupForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const username = signupUserPreview.value;
                if (!username) { alert("Complete details first."); return; }
                if (captchaInput.value !== generatedCaptchaText) { alert("Invalid Captcha."); generateCaptcha(); return; }
                localStorage.setItem("user-profile-" + username, JSON.stringify({ name: signupName.value, dob: signupDob.value, password: signupPassword.value }));
                alert("Registration Complete! System username: " + username);
                loadAuthScreen();
            });
        }

        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const user = document.getElementById("login-username").value.trim();
                const pass = document.getElementById("login-password").value;
                const profileData = JSON.parse(localStorage.getItem("user-profile-" + user));
                if (profileData && profileData.password === pass) {
                    localStorage.setItem("active-login-session", user);
                    triggerCinematicTransition(user);
                } else { alert("Invalid login credentials."); }
            });
        }
    };
    const setupDashboardEvents = (userKey) => {
        if (blurOverlay) blurOverlay.className = "reveal-clear";
        const taskInput = document.getElementById("task-input");
        const taskPriority = document.getElementById("task-priority");
        const addBtn = document.getElementById("add-btn");
        const taskList = document.getElementById("task-list");
        const clearAllBtn = document.getElementById("clear-all-btn");
        const logoutBtn = document.getElementById("logout-btn");
        const historyTrigger = document.getElementById("history-trigger");
        const historyDropdown = document.getElementById("history-dropdown");
        const historyModal = document.getElementById("history-modal");
        const modalCloseBtn = document.getElementById("modal-close-btn");
        const modalDayTitle = document.getElementById("modal-day-title");
        const modalTaskList = document.getElementById("modal-task-list");
        const contactTrigger = document.getElementById("contact-trigger");
        const contactModal = document.getElementById("contact-modal");
        const contactCloseBtn = document.getElementById("contact-close-btn");

        tasks = JSON.parse(localStorage.getItem(userKey + "-tasks-" + activeStorageKey)) || [];
        const saveTasks = () => localStorage.setItem(userKey + "-tasks-" + activeStorageKey, JSON.stringify(tasks));

        const renderTasks = () => {
            if (!taskList) return;
            taskList.innerHTML = "";
            tasks.forEach((taskObj, index) => {
                const li = document.createElement("li");
                li.className = "priority-" + taskObj.priority;
                if (taskObj.completed) li.classList.add("task-done");

                const span = document.createElement("span");
                span.className = "task-text-node"; span.textContent = taskObj.text;
                span.addEventListener("click", () => { tasks[index].completed = !tasks[index].completed; saveTasks(); renderTasks(); });

                const deleteBtn = document.createElement("button");
                deleteBtn.className = "btn-delete"; deleteBtn.textContent = "✕";
                deleteBtn.addEventListener("click", (e) => { e.stopPropagation(); tasks.splice(index, 1); saveTasks(); renderTasks(); });

                li.appendChild(span); li.appendChild(deleteBtn); taskList.appendChild(li);
            });
        };

        if (addBtn) {
            addBtn.addEventListener("click", () => {
                const txt = taskInput.value.trim(); if (!txt) return;
                tasks.push({ text: txt, priority: taskPriority.value, completed: false });
                saveTasks(); renderTasks(); taskInput.value = "";
            });
        }

        if (taskInput) taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addBtn.click(); });
        if (clearAllBtn) clearAllBtn.addEventListener("click", () => { if (confirm("Delete all today's tasks?")) { tasks = []; saveTasks(); renderTasks(); } });

        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                clearInterval(pomodoroInterval);
                localStorage.removeItem("active-login-session");
                loadAuthScreen();
            });
        }

        if (historyTrigger) {
            historyTrigger.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); historyDropdown.classList.toggle("show"); });
        }
        document.addEventListener("click", () => { if (historyDropdown) historyDropdown.classList.remove("show"); });
        if (contactTrigger) contactTrigger.addEventListener("click", (e) => { e.preventDefault(); contactModal.classList.add("open"); });
        if (contactCloseBtn) contactCloseBtn.addEventListener("click", () => contactModal.classList.remove("open"));

        document.querySelectorAll(".dropdown-item").forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                const targetedDayKey = item.getAttribute("data-day");
                if (modalDayTitle) modalDayTitle.textContent = "Day " + targetedDayKey.replace("day", "") + " - " + dayMapping[targetedDayKey];
                const historicalData = JSON.parse(localStorage.getItem(userKey + "-tasks-" + targetedDayKey)) || [];
                if (!modalTaskList) return;
                modalTaskList.innerHTML = "";
                if (historicalData.length === 0) { modalTaskList.innerHTML = "<p style='color:#eee;'>No tasks found for this day.</p>"; }
                else {
                    historicalData.forEach(task => {
                        const historicalLi = document.createElement("li"); historicalLi.className = "modal-li-item";
                        historicalLi.textContent = "[" + task.priority.toUpperCase() + "] " + task.text + " " + (task.completed ? "✓" : "");
                        modalTaskList.appendChild(historicalLi);
                    });
                }
                if (historyModal) historyModal.classList.add("open");
            });
        });
        if (modalCloseBtn) modalCloseBtn.addEventListener("click", () => historyModal.classList.remove("open"));
        renderTasks();
    };
    const setupPomodoroTimer = () => {
        const timerDisplay = document.getElementById("timer-display");
        const timerStatus = document.getElementById("timer-status");
        const startBtn = document.getElementById("timer-start-btn");
        const resetBtn = document.getElementById("timer-reset-btn");
        const alarmAudio = document.getElementById("timer-alarm");

        if (!timerDisplay || !timerStatus || !startBtn || !resetBtn) return;

        const updateTimerInterface = () => {
            const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
            const secs = (timeRemaining % 60).toString().padStart(2, '0');
            timerDisplay.textContent = mins + ":" + secs;
        };

        startBtn.addEventListener("click", () => {
            if (isTimerRunning) {
                clearInterval(pomodoroInterval);
                startBtn.textContent = "Start";
                startBtn.style.background = "#1b4d22";
                timerStatus.textContent = "Timer paused.";
            } else {
                startBtn.textContent = "Pause";
                startBtn.style.background = "#e67e22";
                timerStatus.textContent = "Stay focused on tasks!";

                pomodoroInterval = setInterval(() => {
                    if (timeRemaining > 0) {
                        timeRemaining--;
                        updateTimerInterface();
                    } else {
                        clearInterval(pomodoroInterval);
                        timerStatus.textContent = "Interval complete! Take a break.";
                        startBtn.textContent = "Start";
                        startBtn.style.background = "#1b4d22";
                        isTimerRunning = false;

                        if (alarmAudio) {
                            alarmAudio.play().catch(error => {
                                console.log("Audio play blocked by browser policies: ", error);
                                alert("⏰ Focus session complete! Time to take a break.");
                            });
                        } else {
                            alert("Focus session complete! Time to take a leaf break. 🍃");
                        }

                        timeRemaining = 5 * 60;
                        updateTimerInterface();
                    }
                }, 1000);
            }
            isTimerRunning = !isTimerRunning;
        });

        resetBtn.addEventListener("click", () => {
            clearInterval(pomodoroInterval);
            isTimerRunning = false;
            timeRemaining = 25 * 60;
            startBtn.textContent = "Start";
            startBtn.style.background = "#1b4d22";
            timerStatus.textContent = "Time to focus!";
            updateTimerInterface();

            if (alarmAudio) {
                alarmAudio.pause();
                alarmAudio.currentTime = 0;
            }
        });
    };

    const videoA = document.getElementById("video-a"); const videoB = document.getElementById("video-b");
    const startOffset = 1.5; const endBufferOffset = 0.8;
    let activePlayer = videoA, backupPlayer = videoB, timeupdateListener = null;
    const getVideoSource = () => document.body.classList.contains("dark-theme") ? "leaf2_gwr_video_mvp.mp4" : "leaf.mp4";

    const setupSeamlessLoop = (active, backup) => {
        if (!active || !backup) return;
        if (timeupdateListener) active.removeEventListener("timeupdate", timeupdateListener);
        timeupdateListener = function timeCheck() {
            if (active.currentTime >= active.duration - endBufferOffset) {
                const correctSrc = getVideoSource();
                if (!backup.src.includes(correctSrc)) { backup.src = correctSrc; backup.load(); }
                backup.currentTime = startOffset; backup.play();
                active.classList.remove("buffer-active"); backup.classList.add("buffer-active");
                active.removeEventListener("timeupdate", timeCheck);
                setupSeamlessLoop(backup, active);
            }
        };
        active.addEventListener("timeupdate", timeupdateListener);
    };

    const applyTheme = (theme, isInitialLoad = false) => {
        if (theme === "dark") {
            document.body.classList.remove("light-theme"); document.body.classList.add("dark-theme");
            if (document.getElementById("theme-toggle-btn")) document.getElementById("theme-toggle-btn").textContent = "☀️ Light Mode";
        } else {
            document.body.classList.remove("dark-theme"); document.body.classList.add("light-theme");
            if (document.getElementById("theme-toggle-btn")) document.getElementById("theme-toggle-btn").textContent = "🌙 Dark Mode";
        }
        localStorage.setItem("user-theme", theme);
        const currentTargetSrc = getVideoSource();
        if (isInitialLoad && videoA && videoB) {
            videoA.src = currentTargetSrc; videoB.src = currentTargetSrc;
            videoA.load(); videoB.load(); videoA.currentTime = startOffset; videoB.currentTime = startOffset;
            setupSeamlessLoop(videoA, videoB);
        }
    };

    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "theme-toggle-btn") {
            const newTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
            activePlayer = videoA.classList.contains("buffer-active") ? videoA : videoB;
            backupPlayer = activePlayer === videoA ? videoB : videoA;
            applyTheme(newTheme, false);
            const src = getVideoSource();
            if (activePlayer && backupPlayer) {
                activePlayer.src = src; activePlayer.load(); activePlayer.currentTime = startOffset; activePlayer.play();
                backupPlayer.src = src; backupPlayer.load(); backupPlayer.currentTime = startOffset;
                setupSeamlessLoop(activePlayer, backupPlayer);
            }
        }
    });

        let activeSessionUser = null;
    try {
        activeSessionUser = localStorage.getItem("active-login-session");
    } catch (e) {
        console.log("Local storage temp block on GitHub Pages caught.");
    }

    if (activeSessionUser) {
        loadDashboardScreen(activeSessionUser);
    } else {
        loadAuthScreen();
    }

    let savedTheme = "light";
    try {
        savedTheme = localStorage.getItem("user-theme") || "light";
    } catch (e) {}
    
    applyTheme(savedTheme, true);
});
