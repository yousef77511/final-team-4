const API_BASE = (function() {
  if (typeof window !== "undefined" && window.location) {
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      // If served directly through Flask on port 5000, use origin
      if (window.location.port === "5000") {
        return window.location.origin;
      }
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
  }
  return "http://localhost:5000";
})();

let isBackendOnline = false;


let currentUser = (function() {
  try {
    const saved = localStorage.getItem("medbridge_user");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Error parsing user session:", e);
  }
  return {
    id: "u001-user-donor-001",
    name: "Yousef Protons",
    email: "team4@protons.edu.com",
    role: "donor"
  };
})();


const DEFAULT_STATE = {
  donations: [
    {
      id: "med-001",
      name: "Sterile Gauze Bandages (Box of 50)",
      category: "PPE",
      expiry: "2027-08-15",
      batch: "LOT-8821",
      status: "live",
      donor: "Yousef Protons",
      date: "2026-10-08",
      quantity: 50,
      icon: "🩹"
    },
    {
      id: "med-002",
      name: "Surgical Nitrile Gloves (L)",
      category: "PPE",
      expiry: "2028-01-20",
      batch: "LOT-9942",
      status: "approved",
      donor: "Marwa Protons",
      date: "2026-10-09",
      quantity: 100,
      icon: "🧤"
    },
    {
      id: "med-003",
      name: "Digital Blood Pressure Monitor",
      category: "Equipment",
      expiry: "2030-12-31",
      batch: "EQ-4412",
      status: "pending",
      donor: "Moaz Protons",
      date: "2026-10-10",
      quantity: 4,
      icon: "🩺"
    },
    {
      id: "med-004",
      name: "Amoxicillin 500mg (100 Capsules)",
      category: "Medicine",
      expiry: "2027-04-10",
      batch: "PH-7719",
      status: "live",
      donor: "Yomna Protons",
      date: "2026-10-07",
      quantity: 100,
      icon: "💊"
    },
    {
      id: "med-005",
      name: "Infusion Sets & Syringes 5ml",
      category: "Consumables",
      expiry: "2027-11-30",
      batch: "LOT-3321",
      status: "delivered",
      donor: "Yousef Protons",
      date: "2026-10-05",
      quantity: 200,
      icon: "💉"
    }
  ],
  organizations: [
    {
      id: "org-001-hope-health",
      name: "Hope Health Center",
      type: "Hospital",
      license: "LIC-EGY-2026-081",
      status: "verified",
      address: "12 Al-Galaa St, Cairo",
      phone: "+20223456780"
    },
    {
      id: "org-002-cairo-ngo",
      name: "Care & Relief NGO",
      type: "NGO",
      license: "LIC-EGY-2026-092",
      status: "verified",
      address: "45 Ramses Ave, Cairo",
      phone: "+20223456781"
    },
    {
      id: "org-003-metro-clinic",
      name: "Metro Community Clinic",
      type: "Clinic",
      license: "LIC-EGY-2026-104",
      status: "pending",
      address: "78 Heliopolis St, Cairo",
      phone: "+20223456782"
    }
  ],
  wishlist: [
    {
      id: "wl-01",
      hospital: "Hope Health Center",
      item: "Sterile Surgical Blades No. 11",
      quantity: 200,
      urgency: "High",
      date: "2026-10-09"
    },
    {
      id: "wl-02",
      hospital: "Children Welfare Clinic",
      item: "Infant Oxygen Cannulas",
      quantity: 40,
      urgency: "High",
      date: "2026-10-08"
    },
    {
      id: "wl-03",
      hospital: "Al-Amal Elderly Home",
      item: "Adult Wheelchairs & Walkers",
      quantity: 6,
      urgency: "Medium",
      date: "2026-10-06"
    }
  ],
  auditLogs: [
    { timestamp: "2026-10-10 07:30", user: "System", action: "Platform Startup & Security Check", target: "All Services Online" },
    { timestamp: "2026-10-10 07:15", user: "Moaz Protons", action: "Posted New Donation", target: "Digital Blood Pressure Monitor" },
    { timestamp: "2026-10-09 18:40", user: "Dr. Sarah Quality", action: "Approved Donation", target: "Surgical Nitrile Gloves (L)" },
    { timestamp: "2026-10-08 14:10", user: "Hope Health Center", action: "Posted Wishlist Need", target: "Sterile Surgical Blades No. 11" }
  ],
  chats: {
    "c1": {
      name: "Hope Health Center",
      role: "Verified Partner",
      avatar: "🏥",
      messages: [
        { sender: "them", text: "Hello Protons Team! We saw the posted Amoxicillin listing.", time: "10:15 AM" },
        { sender: "me", text: "Hi! Yes, it has passed our safety review and is available for dispatch.", time: "10:16 AM" },
        { sender: "them", text: "Wonderful! We will submit the dispatch request today.", time: "10:18 AM" }
      ]
    },
    "c2": {
      name: "Protons Logistics Dispatch",
      role: "Courier Team",
      avatar: "🚚",
      messages: [
        { sender: "them", text: "Delivery #DLV-401 for Infusion Sets has been successfully handed over.", time: "Yesterday" },
        { sender: "me", text: "Thanks team! Delivery PIN verified on-site.", time: "Yesterday" }
      ]
    },
    "c3": {
      name: "Metro Community Clinic",
      role: "Awaiting Verification",
      avatar: "⚕️",
      messages: [
        { sender: "them", text: "Hello, we submitted our operating license and tax document.", time: "2 days ago" },
        { sender: "me", text: "Thank you, our compliance team is reviewing the documents.", time: "2 days ago" }
      ]
    }
  },
  activeChatId: "c1"
};

// Load persistent local app state
let appState = (function loadInitialState() {
  try {
    const saved = localStorage.getItem("medbridge_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.donations && parsed.organizations && parsed.wishlist) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Initial state read failed:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
})();

function saveState() {
  try {
    localStorage.setItem("medbridge_state", JSON.stringify(appState));
  } catch (e) {
    console.warn("Local storage write error:", e);
  }
}


function updateUserUI() {
  const avatarElem = document.getElementById("user-display-avatar");
  const nameElem = document.getElementById("user-display-name");
  const emailElem = document.getElementById("user-display-email");
  const topbarAvatar = document.getElementById("topbar-avatar-btn");
  const dropName = document.getElementById("dropdown-user-name");
  const dropEmail = document.getElementById("dropdown-user-email");

  const initial = (currentUser.name || "U").charAt(0).toUpperCase();

  if (avatarElem) avatarElem.innerText = initial;
  if (topbarAvatar) topbarAvatar.innerText = initial;
  if (nameElem) nameElem.innerText = currentUser.name || "Protons Member";
  if (emailElem) emailElem.innerText = currentUser.email || "team4@protons.edu.com";
  if (dropName) dropName.innerText = currentUser.name || "Protons Member";
  if (dropEmail) dropEmail.innerText = currentUser.email || "team4@protons.edu.com";
}

async function handleLogin() {
  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-password");
  const email = (emailInput?.value || "").trim();
  const password = (passInput?.value || "").trim();

  if (!email || !password) {
    toast("Please enter your email and password");
    return;
  }

  try {
    if (isBackendOnline) {
      const res = await fetch(API_BASE + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
      } else {
        currentUser = {
          id: "u001-user-donor-001",
          name: email.split("@")[0].toUpperCase() || "Donor User",
          email: email,
          role: "donor"
        };
      }
    } else {
      currentUser = {
        id: "u001-user-donor-001",
        name: email.split("@")[0].toUpperCase() || "Donor User",
        email: email,
        role: "donor"
      };
    }

    localStorage.setItem("medbridge_user", JSON.stringify(currentUser));
    updateUserUI();
    addAuditLog(currentUser.name, "User Signed In", email);
    toast(`Welcome back, ${currentUser.name}!`);
    showView("home");
  } catch (err) {
    console.error("Login error:", err);
    toast("Signed in (Offline Mode)");
    showView("home");
  }
}

async function handleDonorRegister() {
  const nameInput = document.getElementById("donor-reg-name");
  const emailInput = document.getElementById("donor-reg-email");
  const passInput = document.getElementById("donor-reg-password");

  const name = (nameInput?.value || "").trim();
  const email = (emailInput?.value || "").trim();
  const password = (passInput?.value || "").trim();

  if (!name || !email || !password) {
    toast("Please complete all donor registration fields");
    return;
  }

  try {
    if (isBackendOnline) {
      const res = await fetch(API_BASE + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "donor" })
      });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
      } else {
        currentUser = { id: "u-" + Date.now().toString(36), name, email, role: "donor" };
      }
    } else {
      currentUser = { id: "u-" + Date.now().toString(36), name, email, role: "donor" };
    }

    localStorage.setItem("medbridge_user", JSON.stringify(currentUser));
    updateUserUI();
    addAuditLog(name, "Registered Donor Account", email);
    toast("Donor Account registered successfully!");
    showView("additem");
  } catch (err) {
    console.error("Donor registration error:", err);
    toast("Account created successfully");
    showView("additem");
  }
}

async function handleOrgRegister() {
  const nameInput = document.getElementById("org-reg-name");
  const typeInput = document.getElementById("org-reg-type");
  const licInput = document.getElementById("org-reg-license");
  const phoneInput = document.getElementById("org-reg-phone");
  const addrInput = document.getElementById("org-reg-address");
  const emailInput = document.getElementById("org-reg-email");

  const name = (nameInput?.value || "").trim();
  const type = typeInput?.value || "hospital";
  const license = (licInput?.value || "").trim();
  const phone = (phoneInput?.value || "").trim();
  const address = (addrInput?.value || "").trim();
  const email = (emailInput?.value || "").trim();

  if (!name || !license || !phone || !address) {
    toast("Please fill in the required organization details");
    return;
  }

  const newOrg = {
    id: "org-" + Date.now().toString(36),
    name,
    type: type.charAt(0).toUpperCase() + type.slice(1),
    license,
    status: "pending",
    address,
    phone
  };

  appState.organizations.unshift(newOrg);
  saveState();

  if (isBackendOnline) {
    try {
      await fetch(API_BASE + "/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newOrg.id,
          name,
          type,
          license_number: license,
          phone,
          address
        })
      });
    } catch (e) {
      console.warn("Backend org registration notice:", e);
    }
  }

  addAuditLog(name, "Submitted Organization Registration", license);
  toast("Organization profile registered. Please upload verification documents.");
  renderAdminOrgs();
  showView("orgdocs");
}

function handleLogout() {
  currentUser = {
    id: "u001-user-donor-001",
    name: "Guest User",
    email: "guest@medbridge.org",
    role: "user"
  };
  localStorage.removeItem("medbridge_user");
  updateUserUI();
  toast("Signed out successfully");
  showView("auth");
}

function handleFileSelect(inputId, labelId) {
  const input = document.getElementById(inputId);
  const label = document.getElementById(labelId);
  if (input && input.files && input.files.length > 0) {
    const file = input.files[0];
    if (label) {
      label.innerText = `Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`;
    }
    toast(`File attached: ${file.name}`);
  }
}

function submitVerificationDocs() {
  toast("Verification documents uploaded and queued for compliance review");
  addAuditLog(currentUser.name, "Submitted Verification Credentials", "License & Tax Certificate");
  showView("adminorgs");
}


async function checkBackendHealth() {
  const dot = document.getElementById("api-status-dot");
  const text = document.getElementById("api-status-text");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(API_BASE + "/api/health", {
      method: "GET",
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      isBackendOnline = true;
      if (dot) dot.className = "status-dot online";
      if (text) text.innerText = data.mysql_connected ? "API & MySQL Online" : "API Online (Active)";
      syncWithBackend();
    } else {
      throw new Error("API responded with non-200");
    }
  } catch (e) {
    isBackendOnline = false;
    if (dot) dot.className = "status-dot offline";
    if (text) text.innerText = "Offline Mode (Local)";
  }
}

async function syncWithBackend() {
  if (!isBackendOnline) return;

  try {
    const [donationsRes, requestsRes, orgsRes, statsRes] = await Promise.allSettled([
      fetch(API_BASE + "/api/donations"),
      fetch(API_BASE + "/api/requests"),
      fetch(API_BASE + "/api/organizations"),
      fetch(API_BASE + "/api/stats")
    ]);

    if (donationsRes.status === "fulfilled" && donationsRes.value.ok) {
      const dbDonations = await donationsRes.value.json();
      if (Array.isArray(dbDonations) && dbDonations.length > 0) {
        dbDonations.forEach(d => {
          const existing = appState.donations.find(item => item.id === d.id);
          const mappedCategory = d.type === "medicine" ? "Medicine" : d.type === "equipment" ? "Equipment" : d.type === "ppe" ? "PPE" : "Consumables";
          const mappedStatus = d.status === "pending_review" ? "pending" : (d.status === "approved" ? "live" : d.status);

          if (!existing) {
            appState.donations.unshift({
              id: d.id,
              name: d.name,
              category: mappedCategory,
              expiry: "2027-12-31",
              batch: "LOT-" + (d.id || "0000").slice(0, 4).toUpperCase(),
              status: mappedStatus,
              donor: d.donor_name || "Verified Donor",
              date: d.created_at ? d.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
              quantity: 1,
              icon: getCategoryIcon(d.type)
            });
          } else {
            existing.status = mappedStatus;
          }
        });
        saveState();
      }
    }

    if (requestsRes.status === "fulfilled" && requestsRes.value.ok) {
      const dbRequests = await requestsRes.value.json();
      if (Array.isArray(dbRequests) && dbRequests.length > 0) {
        dbRequests.forEach(r => {
          const existing = appState.wishlist.find(w => w.id === r.id);
          if (!existing) {
            appState.wishlist.unshift({
              id: r.id,
              hospital: r.organization_name || "Partner Medical Facility",
              item: r.item_name,
              quantity: r.quantity_needed,
              urgency: r.urgency === "high" ? "High" : r.urgency === "medium" ? "Medium" : "Low",
              date: r.created_at ? r.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)
            });
          }
        });
        saveState();
      }
    }

    if (orgsRes.status === "fulfilled" && orgsRes.value.ok) {
      const dbOrgs = await orgsRes.value.json();
      if (Array.isArray(dbOrgs) && dbOrgs.length > 0) {
        dbOrgs.forEach(o => {
          const existing = appState.organizations.find(org => org.id === o.id);
          const isVerified = Boolean(o.verified === 1 || o.verified === true);
          if (!existing) {
            appState.organizations.unshift({
              id: o.id,
              name: o.name,
              type: o.type === "hospital" ? "Hospital" : o.type === "ngo" ? "NGO" : "Clinic",
              license: o.license_number,
              status: isVerified ? "verified" : "pending",
              address: o.address,
              phone: o.phone
            });
          } else {
            existing.status = isVerified ? "verified" : "pending";
          }
        });
        saveState();
      }
    }

    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      const stats = await statsRes.value.json();
      updateDashboardStatsWithBackend(stats);
    }

    renderHomeRecent();
    renderBrowseGrid();
    renderMyDonations();
    renderPendingReview();
    renderLiveInventory();
    renderWishlist();
    renderAdminOrgs();
    updateImpactStats();
  } catch (e) {
    console.warn("Backend sync notice:", e);
  }
}

function updateDashboardStatsWithBackend(stats) {
  const homeTotal = document.getElementById("home-stat-total");
  const homeOrgs = document.getElementById("home-stat-orgs");
  const stTotal = document.getElementById("st-total");
  const stDelivered = document.getElementById("st-delivered");
  const stOrgs = document.getElementById("st-orgs");
  const stImpact = document.getElementById("st-impact");

  if (homeTotal) homeTotal.innerText = stats.total_donations + " Items";
  if (homeOrgs) homeOrgs.innerText = stats.verified_organizations;
  if (stTotal) stTotal.innerText = stats.total_donations;
  if (stDelivered) stDelivered.innerText = stats.delivered_donations;
  if (stOrgs) stOrgs.innerText = stats.verified_organizations;
  if (stImpact) stImpact.innerText = (stats.lives_impacted || 1200).toLocaleString() + "+";
}


function showView(viewId) {
  const panels = document.querySelectorAll(".view-panel");
  panels.forEach(p => p.classList.remove("active"));

  const target = document.getElementById("view-" + viewId);
  if (target) {
    target.classList.add("active");
  }

  const navItems = document.querySelectorAll(".nav-item, .bnav-item");
  navItems.forEach(n => n.classList.remove("active"));

  const activeNav = document.getElementById("nav-" + viewId);
  if (activeNav) activeNav.classList.add("active");

  const titles = {
    home: "Dashboard",
    auth: "Account Portal",
    orgdocs: "Document Verification",
    adminorgs: "Organization Approvals",
    additem: "Post a Donation",
    mydonations: "My Donations",
    edititem: "Edit Listings",
    browse: "Browse Supplies",
    wishlist: "Hospital Requests",
    pendingreview: "Safety Review",
    managelive: "Live Inventory",
    activitylog: "Audit Log",
    chat: "Messages",
    delivery: "Delivery Code",
    impact: "Impact & Tax",
    about: "Our Team"
  };

  const titleElem = document.getElementById("page-title");
  if (titleElem && titles[viewId]) {
    titleElem.innerText = titles[viewId];
  }

  if (viewId === "home") renderHomeRecent();
  if (viewId === "browse") renderBrowseGrid();
  if (viewId === "mydonations") renderMyDonations();
  if (viewId === "pendingreview") renderPendingReview();
  if (viewId === "managelive") renderLiveInventory();
  if (viewId === "adminorgs") renderAdminOrgs();
  if (viewId === "wishlist") renderWishlist();
  if (viewId === "edititem") populateEditSelect();
  if (viewId === "activitylog") renderAuditLog();
  if (viewId === "chat") renderChat();
  if (viewId === "impact") updateImpactStats();

  closeDropdowns();

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
  }

  const contentArea = document.querySelector(".content");
  if (contentArea) contentArea.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (!sidebar) return;
  sidebar.classList.toggle("open");
  if (overlay) overlay.classList.toggle("open");
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute("data-theme");
  if (current === "dark") {
    root.removeAttribute("data-theme");
    localStorage.setItem("medbridge_theme", "light");
  } else {
    root.setAttribute("data-theme", "dark");
    localStorage.setItem("medbridge_theme", "dark");
  }
}

function toggleDropdown(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const isActive = target.classList.contains("active");
  closeDropdowns();
  if (!isActive) {
    target.classList.add("active");
  }
}

function closeDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown-panel, .dropdown-menu");
  dropdowns.forEach(d => d.classList.remove("active"));
}

window.addEventListener("click", function(event) {
  if (!event.target.closest(".icon-btn") && !event.target.closest(".avatar-btn")) {
    closeDropdowns();
  }
});

function switchTab(group, tabId, btn) {
  const parent = btn.closest(".card");
  if (!parent) return;
  const tabs = parent.querySelectorAll(".tab-btn");
  const panes = parent.querySelectorAll(".tab-pane");

  tabs.forEach(t => t.classList.remove("active"));
  panes.forEach(p => p.classList.remove("active"));

  btn.classList.add("active");
  const targetPane = document.getElementById(group + "-" + tabId);
  if (targetPane) targetPane.classList.add("active");
}


function navWizard(step) {
  if (step === 2) {
    const nameVal = (document.getElementById("ai-name")?.value || "").trim();
    if (!nameVal) {
      toast("Please enter an item name first");
      return;
    }
  }

  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById("sdot-" + i);
    const pane = document.getElementById("spane-" + i);
    if (dot) dot.classList.remove("active");
    if (pane) pane.classList.remove("active");
  }

  const currentDot = document.getElementById("sdot-" + step);
  const currentPane = document.getElementById("spane-" + step);
  if (currentDot) currentDot.classList.add("active");
  if (currentPane) currentPane.classList.add("active");

  if (step === 3) {
    const name = document.getElementById("ai-name").value.trim() || "Unspecified Item";
    const cat = document.getElementById("ai-cat").value;
    const exp = document.getElementById("ai-exp").value || "N/A";
    const batch = document.getElementById("ai-batch").value.trim() || "N/A";

    const summary = document.getElementById("wizard-summary");
    if (summary) {
      summary.innerHTML = `
        <div style="line-height:1.7">
          <div><strong>Item:</strong> ${escapeHtml(name)}</div>
          <div><strong>Category:</strong> ${escapeHtml(cat)}</div>
          <div><strong>Expiry:</strong> ${escapeHtml(exp)}</div>
          <div><strong>Batch:</strong> ${escapeHtml(batch)}</div>
          <div><strong>Status:</strong> <span class="badge badge-pending">Pending Safety Review</span></div>
        </div>
      `;
    }
  }
}

async function submitDonation() {
  const nameInput = document.getElementById("ai-name");
  const catInput = document.getElementById("ai-cat");
  const expInput = document.getElementById("ai-exp");
  const batchInput = document.getElementById("ai-batch");

  const name = nameInput.value.trim();
  if (!name) {
    toast("Please enter an item name before submitting");
    navWizard(1);
    return;
  }

  const catVal = catInput.value;
  let newId = "med-" + Date.now().toString(36);
  const expiryVal = expInput.value || "2027-12-31";
  const batchVal = batchInput.value.trim() || "LOT-" + Math.floor(1000 + Math.random() * 9000);

  const newDonation = {
    id: newId,
    name: name,
    category: catVal,
    expiry: expiryVal,
    batch: batchVal,
    status: "pending",
    donor: currentUser.name || "Yousef Protons",
    date: new Date().toISOString().slice(0, 10),
    quantity: 10,
    icon: getCategoryIcon(catVal)
  };

  if (isBackendOnline) {
    try {
      const typeMap = { "PPE": "ppe", "Equipment": "equipment", "Medicine": "medicine", "Consumables": "consumables" };
      const catIdMap = { "PPE": 1, "Equipment": 2, "Medicine": 3, "Consumables": 4 };

      const res = await fetch(API_BASE + "/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId,
          donor_id: currentUser.id || "u001-user-donor-001",
          category_id: catIdMap[catVal] || 1,
          type: typeMap[catVal] || "ppe",
          name: name,
          description: `Batch: ${batchVal}, Expiry: ${expiryVal}`,
          location: "Cairo Central Depot"
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          newDonation.id = data.id;
        }
      }
    } catch (e) {
      console.warn("Backend donation post notice:", e);
    }
  }

  appState.donations.unshift(newDonation);
  addAuditLog(currentUser.name, "Submitted Donation Listing", name);
  saveState();

  nameInput.value = "";
  expInput.value = "";
  batchInput.value = "";
  navWizard(1);

  toast("Donation submitted for safety review");
  showView("mydonations");
}

function handleGlobalSearch(query) {
  if (query.trim().length > 0) {
    showView("browse");
    const searchInput = document.getElementById("browse-search");
    if (searchInput) {
      searchInput.value = query;
      renderBrowseGrid();
    }
  }
}


function regenerateDeliveryCode() {
  const pinElem = document.getElementById("delivery-pin");
  if (pinElem) {
    const randomPin = Math.floor(100000 + Math.random() * 900000);
    pinElem.innerText = randomPin;
  }

  const qrMatrix = document.getElementById("qr-matrix");
  if (qrMatrix) {
    qrMatrix.innerHTML = "";
    for (let i = 0; i < 64; i++) {
      const pixel = document.createElement("div");
      pixel.className = "qr-pixel" + (Math.random() > 0.4 ? " on" : "");
      qrMatrix.appendChild(pixel);
    }
  }
  toast("Generated secure delivery verification code");
}

function printTaxReceipt() {
  window.print();
}


function renderHomeRecent() {
  const container = document.getElementById("home-recent-grid");
  if (!container) return;

  const totalElem = document.getElementById("home-stat-total");
  const orgsElem = document.getElementById("home-stat-orgs");
  if (totalElem) totalElem.innerText = appState.donations.length + " Items";
  if (orgsElem) orgsElem.innerText = appState.organizations.filter(o => o.status === "verified").length;

  const recent = appState.donations.slice(0, 4);
  if (recent.length === 0) {
    container.innerHTML = `<p style="color:var(--muted);grid-column:1/-1">No supplies listed yet. Click 'Post Donation' to begin.</p>`;
    return;
  }

  container.innerHTML = recent.map(item => `
    <div class="item-card">
      <div class="item-header">
        <div class="item-icon">${item.icon || getCategoryIcon(item.category)}</div>
        <span class="badge ${getBadgeClass(item.status)}">${formatStatus(item.status)}</span>
      </div>
      <div>
        <h4 class="item-title">${escapeHtml(item.name)}</h4>
        <div class="item-meta">
          <span>${escapeHtml(item.category)}</span>
          <span>Exp: ${escapeHtml(item.expiry)}</span>
        </div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="showView('browse')">View in Catalog</button>
    </div>
  `).join("");
}

function renderBrowseGrid() {
  const container = document.getElementById("browse-grid");
  if (!container) return;

  const searchVal = (document.getElementById("browse-search")?.value || "").toLowerCase().trim();
  const catVal = document.getElementById("browse-cat")?.value || "";

  const filtered = appState.donations.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchVal) ||
      d.category.toLowerCase().includes(searchVal) ||
      (d.batch && d.batch.toLowerCase().includes(searchVal));
    const matchCat = catVal === "" || d.category === catVal;
    return matchSearch && matchCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--muted)">
        <div style="font-size:28px;margin-bottom:6px">🔍</div>
        <p style="margin:0">No medical supplies matching your search criteria.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="item-card">
      <div class="item-header">
        <div class="item-icon">${item.icon || getCategoryIcon(item.category)}</div>
        <span class="badge ${getBadgeClass(item.status)}">${formatStatus(item.status)}</span>
      </div>
      <div>
        <h4 class="item-title">${escapeHtml(item.name)}</h4>
        <div class="item-meta" style="margin-top:4px">
          <span>${escapeHtml(item.category)}</span>
          <span>Batch: ${escapeHtml(item.batch || "N/A")}</span>
          <span>Exp: ${escapeHtml(item.expiry || "N/A")}</span>
        </div>
      </div>
      <div style="margin-top:auto;padding-top:8px">
        <button class="btn btn-secondary btn-sm full-w" onclick="requestItem('${item.id}')">
          ${item.status === 'delivered' ? 'Delivered' : item.status === 'live' ? 'Request Item' : 'Reserve Supply'}
        </button>
      </div>
    </div>
  `).join("");
}

async function requestItem(id) {
  const item = appState.donations.find(d => d.id === id);
  if (!item) return;

  if (item.status === "delivered") {
    toast("This item has already been delivered to a receiving facility.");
    return;
  }

  item.status = "live";
  addAuditLog(currentUser.name, "Requested Medical Supply", item.name);
  saveState();
  toast(`Request for '${item.name}' dispatched to logistics.`);
  renderBrowseGrid();
}

function renderMyDonations() {
  const container = document.getElementById("my-donations-list");
  if (!container) return;

  if (appState.donations.length === 0) {
    container.innerHTML = `<p style="color:var(--muted)">You have not posted any donations yet.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Batch</th>
            <th>Expiry</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${appState.donations.map(item => `
            <tr>
              <td><strong>${escapeHtml(item.name)}</strong></td>
              <td>${escapeHtml(item.category)}</td>
              <td><code>${escapeHtml(item.batch || "N/A")}</code></td>
              <td>${escapeHtml(item.expiry || "N/A")}</td>
              <td><span class="badge ${getBadgeClass(item.status)}">${formatStatus(item.status)}</span></td>
              <td>
                <button class="btn btn-ghost btn-sm" onclick="editSingleItem('${item.id}')">Edit</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPendingReview() {
  const container = document.getElementById("pending-items-list");
  if (!container) return;

  const pending = appState.donations.filter(d => d.status === "pending" || d.status === "pending_review");
  if (pending.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:24px;color:var(--muted)">
        <p style="margin:0">Safety queue is clear. All listings have been reviewed.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Expiration</th>
            <th>Donor</th>
            <th>Decision</th>
          </tr>
        </thead>
        <tbody>
          ${pending.map(item => `
            <tr>
              <td>
                <strong>${escapeHtml(item.name)}</strong><br>
                <small style="color:var(--muted)">Batch: ${escapeHtml(item.batch || "N/A")}</small>
              </td>
              <td>${escapeHtml(item.category)}</td>
              <td>${escapeHtml(item.expiry || "N/A")}</td>
              <td>${escapeHtml(item.donor || "Protons Member")}</td>
              <td>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <button class="btn btn-success btn-sm" onclick="reviewItem('${item.id}', 'approved')">Approve</button>
                  <button class="btn btn-ghost btn-sm" onclick="reviewItem('${item.id}', 'maintenance')">Maintain</button>
                  <button class="btn btn-danger-outline btn-sm" onclick="reviewItem('${item.id}', 'rejected')">Reject</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function reviewItem(id, result) {
  const item = appState.donations.find(d => d.id === id);
  if (!item) return;

  if (result === "approved") {
    item.status = "live";
    addAuditLog("Dr. Sarah Quality", "Approved Donation Listing", item.name);
    toast(`'${item.name}' approved for live catalog.`);
  } else if (result === "maintenance") {
    item.status = "pending";
    addAuditLog("Dr. Sarah Quality", "Flagged Item for Maintenance", item.name);
    toast(`'${item.name}' flagged for maintenance.`);
  } else {
    item.status = "rejected";
    addAuditLog("Dr. Sarah Quality", "Rejected Item", item.name);
    toast(`'${item.name}' rejected.`);
  }

  saveState();
  renderPendingReview();
  renderHomeRecent();
  renderLiveInventory();

  if (isBackendOnline) {
    try {
      await fetch(API_BASE + "/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donation_id: item.id,
          inspector_id: "u002-user-reviewer-01",
          result: result === "approved" ? "approved" : result === "maintenance" ? "needs_maintenance" : "rejected",
          notes: "Audit completed via safety queue interface"
        })
      });
    } catch (e) {
      console.warn("Backend review post error:", e);
    }
  }
}

function renderLiveInventory() {
  const container = document.getElementById("live-items-list");
  if (!container) return;

  const liveItems = appState.donations.filter(d => d.status === "live" || d.status === "approved" || d.status === "delivered");
  if (liveItems.length === 0) {
    container.innerHTML = `<p style="color:var(--muted)">No items currently active in live catalog.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Batch Code</th>
            <th>Status</th>
            <th>Logistics</th>
          </tr>
        </thead>
        <tbody>
          ${liveItems.map(item => `
            <tr>
              <td><strong>${escapeHtml(item.name)}</strong></td>
              <td>${escapeHtml(item.category)}</td>
              <td><code>${escapeHtml(item.batch || "N/A")}</code></td>
              <td><span class="badge ${getBadgeClass(item.status)}">${formatStatus(item.status)}</span></td>
              <td>
                ${item.status === "delivered"
                  ? `<span style="color:var(--success);font-size:12px;font-weight:600">✓ Delivered</span>`
                  : `<button class="btn btn-sm btn-outline" onclick="markDelivered('${item.id}')">Mark Delivered</button>`
                }
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function markDelivered(id) {
  const item = appState.donations.find(d => d.id === id);
  if (!item) return;

  item.status = "delivered";
  addAuditLog("Logistics Courier", "Completed Handover & Verified Delivery", item.name);
  saveState();
  toast(`'${item.name}' marked as Delivered.`);
  renderLiveInventory();
  updateImpactStats();

  if (isBackendOnline) {
    try {
      await fetch(API_BASE + "/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: item.id,
          courier_name: "Protons Logistics Dispatch",
          pickup_date: new Date().toISOString().slice(0, 19).replace("T", " ")
        })
      });
    } catch (e) {
      console.warn("Backend delivery sync error:", e);
    }
  }
}

function renderAdminOrgs() {
  const container = document.getElementById("admin-orgs-list");
  if (!container) return;

  const countBadge = document.getElementById("org-count-badge");
  const pendingCount = appState.organizations.filter(o => o.status === "pending").length;
  if (countBadge) {
    countBadge.innerText = pendingCount + " pending";
  }

  if (appState.organizations.length === 0) {
    container.innerHTML = `<p style="color:var(--muted)">No organization records found.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Organization</th>
            <th>Type</th>
            <th>License</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${appState.organizations.map(org => `
            <tr>
              <td><strong>${escapeHtml(org.name)}</strong></td>
              <td>${escapeHtml(org.type)}</td>
              <td><code>${escapeHtml(org.license)}</code></td>
              <td>${escapeHtml(org.phone)}<br><small style="color:var(--muted)">${escapeHtml(org.address)}</small></td>
              <td>
                <span class="badge ${org.status === 'verified' ? 'badge-live' : 'badge-pending'}">
                  ${org.status === 'verified' ? 'Verified' : 'Pending'}
                </span>
              </td>
              <td>
                ${org.status === 'verified'
                  ? `<span style="color:var(--success);font-weight:600;font-size:12px">✓ Verified</span>`
                  : `<button class="btn btn-sm btn-primary" onclick="approveOrg('${org.id}')">Verify</button>`
                }
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function approveOrg(id) {
  const org = appState.organizations.find(o => o.id === id);
  if (!org) return;

  org.status = "verified";
  addAuditLog("Admin Supervisor", "Verified Organization Accreditation", org.name);
  saveState();
  toast(`'${org.name}' verified successfully`);
  renderAdminOrgs();
  updateImpactStats();

  if (isBackendOnline) {
    try {
      await fetch(API_BASE + `/api/organizations/${org.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true })
      });
    } catch (e) {
      console.warn("Backend org approval error:", e);
    }
  }
}

function renderWishlist() {
  const container = document.getElementById("wishlist-items-list");
  if (!container) return;

  if (appState.wishlist.length === 0) {
    container.innerHTML = `<p style="color:var(--muted)">No active facility requests.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Facility</th>
            <th>Required Supplies</th>
            <th>Quantity</th>
            <th>Urgency</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${appState.wishlist.map(w => `
            <tr>
              <td><strong>${escapeHtml(w.hospital)}</strong></td>
              <td>${escapeHtml(w.item)}</td>
              <td>${escapeHtml(w.quantity)} units</td>
              <td>
                <span class="badge ${w.urgency === 'High' ? 'badge-danger' : w.urgency === 'Medium' ? 'badge-pending' : 'badge-live'}">
                  ${escapeHtml(w.urgency)}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="fulfillWishlist('${w.id}')">Fulfill</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function addWishlistItem() {
  const hospInput = document.getElementById("wl-hosp");
  const itemInput = document.getElementById("wl-item");
  const qtyInput = document.getElementById("wl-qty");
  const urgInput = document.getElementById("wl-urg");

  const hosp = hospInput.value.trim();
  const item = itemInput.value.trim();
  const qty = parseInt(qtyInput.value, 10);

  if (!hosp || !item || isNaN(qty) || qty <= 0) {
    toast("Please enter a facility name, item description, and valid quantity");
    return;
  }

  let newId = "wl-" + Date.now().toString(36);
  const newWish = {
    id: newId,
    hospital: hosp,
    item: item,
    quantity: qty,
    urgency: urgInput.value,
    date: new Date().toISOString().slice(0, 10)
  };

  if (isBackendOnline) {
    try {
      const res = await fetch(API_BASE + "/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId,
          organization_id: "org-001-hope-health",
          category_id: 1,
          item_name: item,
          quantity_needed: qty,
          urgency: urgInput.value.toLowerCase()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id) newWish.id = data.id;
      }
    } catch (e) {
      console.warn("Backend wishlist post error:", e);
    }
  }

  appState.wishlist.unshift(newWish);
  addAuditLog(hosp, "Published Urgent Supply Need", `${item} (${qty} units)`);
  saveState();

  hospInput.value = "";
  itemInput.value = "";
  qtyInput.value = "";

  toast("Hospital request published to platform");
  renderWishlist();
}

async function fulfillWishlist(id) {
  const wish = appState.wishlist.find(w => w.id === id);
  if (!wish) return;

  addAuditLog(currentUser.name, "Claimed Need For Fulfillment", `${wish.hospital} - ${wish.item}`);
  toast(`Opening donation form for '${wish.item}'`);
  showView("additem");
  const nameField = document.getElementById("ai-name");
  if (nameField) nameField.value = wish.item;

  if (isBackendOnline) {
    try {
      await fetch(API_BASE + `/api/requests/${wish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "fulfilled" })
      });
    } catch (e) {
      console.warn("Backend fulfill wishlist error:", e);
    }
  }
}


function populateEditSelect() {
  const select = document.getElementById("edit-item-select");
  if (!select) return;

  select.innerHTML = `<option value="">-- Choose item to edit --</option>` +
    appState.donations.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${escapeHtml(d.category)})</option>`).join("");

  loadEditForm();
}

function editSingleItem(id) {
  showView("edititem");
  const select = document.getElementById("edit-item-select");
  if (select) {
    select.value = id;
    loadEditForm();
  }
}

function loadEditForm() {
  const select = document.getElementById("edit-item-select");
  const container = document.getElementById("edit-form-container");
  if (!container || !select) return;

  const id = select.value;
  const item = appState.donations.find(d => d.id === id);

  if (!item) {
    container.innerHTML = `<p style="color:var(--muted);margin-top:14px">Select an item above to modify or delete.</p>`;
    return;
  }

  container.innerHTML = `
    <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:14px">
      <div class="field">
        <label>Item Name</label>
        <input type="text" id="edit-name" value="${escapeHtml(item.name)}">
      </div>
      <div class="grid-2">
        <div class="field">
          <label>Category</label>
          <select id="edit-cat">
            <option value="PPE" ${item.category === 'PPE' ? 'selected' : ''}>PPE & Protection</option>
            <option value="Equipment" ${item.category === 'Equipment' ? 'selected' : ''}>Medical Equipment</option>
            <option value="Medicine" ${item.category === 'Medicine' ? 'selected' : ''}>Pharmaceuticals</option>
            <option value="Consumables" ${item.category === 'Consumables' ? 'selected' : ''}>Consumable Supplies</option>
          </select>
        </div>
        <div class="field">
          <label>Status</label>
          <select id="edit-status">
            <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending Review</option>
            <option value="approved" ${item.status === 'approved' ? 'selected' : ''}>Approved</option>
            <option value="live" ${item.status === 'live' ? 'selected' : ''}>Live Catalog</option>
            <option value="delivered" ${item.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </div>
      </div>
      <div class="grid-2">
        <div class="field">
          <label>Batch Code</label>
          <input type="text" id="edit-batch" value="${escapeHtml(item.batch || '')}">
        </div>
        <div class="field">
          <label>Expiry Date</label>
          <input type="date" id="edit-exp" value="${escapeHtml(item.expiry || '')}">
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" onclick="saveEditedItem('${item.id}')">Save Changes</button>
        <button class="btn btn-danger-outline" onclick="deleteItem('${item.id}')">Delete Listing</button>
      </div>
    </div>
  `;
}

async function saveEditedItem(id) {
  const item = appState.donations.find(d => d.id === id);
  if (!item) return;

  const newName = document.getElementById("edit-name").value.trim();
  if (!newName) {
    toast("Item name cannot be empty");
    return;
  }

  item.name = newName;
  item.category = document.getElementById("edit-cat").value;
  item.status = document.getElementById("edit-status").value;
  item.batch = document.getElementById("edit-batch").value.trim();
  item.expiry = document.getElementById("edit-exp").value;
  item.icon = getCategoryIcon(item.category);

  addAuditLog(currentUser.name, "Updated Listing Details", item.name);
  saveState();
  toast(`'${item.name}' updated successfully`);
  populateEditSelect();

  if (isBackendOnline) {
    try {
      const typeMap = { "PPE": "ppe", "Equipment": "equipment", "Medicine": "medicine", "Consumables": "consumables" };
      await fetch(API_BASE + `/api/donations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          type: typeMap[item.category] || "ppe",
          status: item.status === "live" ? "approved" : item.status
        })
      });
    } catch (e) {
      console.warn("Backend update error:", e);
    }
  }
}

async function deleteItem(id) {
  const index = appState.donations.findIndex(d => d.id === id);
  if (index === -1) return;

  const deletedName = appState.donations[index].name;
  appState.donations.splice(index, 1);
  addAuditLog(currentUser.name, "Deleted Donation Listing", deletedName);
  saveState();

  toast(`'${deletedName}' removed`);
  populateEditSelect();
  renderMyDonations();

  if (isBackendOnline) {
    try {
      await fetch(API_BASE + `/api/donations/${id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.warn("Backend delete error:", e);
    }
  }
}


function renderAuditLog() {
  const tbody = document.getElementById("audit-log-body");
  if (!tbody) return;

  if (appState.auditLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted)">No logged activity.</td></tr>`;
    return;
  }

  tbody.innerHTML = appState.auditLogs.map(log => `
    <tr>
      <td><code>${escapeHtml(log.timestamp)}</code></td>
      <td><strong>${escapeHtml(log.user)}</strong></td>
      <td>${escapeHtml(log.action)}</td>
      <td><span>${escapeHtml(log.target)}</span></td>
    </tr>
  `).join("");
}

function addAuditLog(user, action, target) {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace("T", " ");
  appState.auditLogs.unshift({ timestamp, user, action, target });
  saveState();
  renderAuditLog();

  if (isBackendOnline) {
    try {
      fetch(API_BASE + "/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, action, target })
      }).catch(() => {});
    } catch (e) {}
  }
}


function renderChat() {
  const threadsContainer = document.getElementById("chat-threads");
  const messagesContainer = document.getElementById("chat-messages-container");
  if (!threadsContainer || !messagesContainer) return;

  const chatKeys = Object.keys(appState.chats);
  if (!appState.activeChatId || !appState.chats[appState.activeChatId]) {
    appState.activeChatId = chatKeys[0];
  }

  threadsContainer.innerHTML = chatKeys.map(k => {
    const thread = appState.chats[k];
    const isActive = k === appState.activeChatId;
    return `
      <div class="chat-convo ${isActive ? 'active' : ''}" onclick="switchChatThread('${k}')">
        <div style="font-weight:600;display:flex;align-items:center;gap:6px">
          <span>${thread.avatar || '💬'}</span>
          <span>${escapeHtml(thread.name)}</span>
        </div>
        <small style="color:var(--muted);font-size:11px">${escapeHtml(thread.role)}</small>
      </div>
    `;
  }).join("");

  const activeThread = appState.chats[appState.activeChatId];
  messagesContainer.innerHTML = activeThread.messages.map(m => `
    <div class="message ${m.sender === 'me' ? 'me' : 'them'}">
      <div>${escapeHtml(m.text)}</div>
      <div style="font-size:10px;opacity:0.7;text-align:right;margin-top:2px">${escapeHtml(m.time || '')}</div>
    </div>
  `).join("");

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function switchChatThread(id) {
  appState.activeChatId = id;
  renderChat();
}

function sendChatMessage() {
  const input = document.getElementById("chat-input");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const activeThread = appState.chats[appState.activeChatId];
  if (!activeThread) return;

  activeThread.messages.push({ sender: "me", text: text, time: time });
  input.value = "";
  renderChat();
  saveState();

  setTimeout(() => {
    const replies = [
      "Thank you! We received your message and are coordinating with logistics.",
      "Acknowledged. We appreciate the fast communication and support!",
      "Our logistics driver will present the delivery security PIN upon arrival.",
      "Supplies verified by hospital staff. Thank you for your partnership!"
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];
    activeThread.messages.push({
      sender: "them",
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    renderChat();
    saveState();
  }, 900);
}


function updateImpactStats() {
  const totalElem = document.getElementById("st-total");
  const deliveredElem = document.getElementById("st-delivered");
  const orgsElem = document.getElementById("st-orgs");
  const impactElem = document.getElementById("st-impact");

  const total = appState.donations.length;
  const delivered = appState.donations.filter(d => d.status === "delivered").length;
  const orgs = appState.organizations.filter(o => o.status === "verified").length;
  const livesImpacted = (delivered * 250) + 1200;

  if (totalElem) totalElem.innerText = total;
  if (deliveredElem) deliveredElem.innerText = delivered;
  if (orgsElem) orgsElem.innerText = orgs;
  if (impactElem) impactElem.innerText = livesImpacted.toLocaleString() + "+";
}


function getCategoryIcon(category) {
  switch (category) {
    case "PPE":
    case "ppe": return "🧤";
    case "Equipment":
    case "equipment": return "🩺";
    case "Medicine":
    case "medicine": return "💊";
    case "Consumables":
    case "consumables": return "💉";
    default: return "📦";
  }
}

function getBadgeClass(status) {
  switch (status) {
    case "live": return "badge-live";
    case "approved": return "badge-claimed";
    case "pending":
    case "pending_review": return "badge-pending";
    case "delivered": return "badge-live";
    case "rejected": return "badge-danger";
    default: return "badge-hidden";
  }
}

function formatStatus(status) {
  switch (status) {
    case "live": return "Available in Catalog";
    case "approved": return "Quality Approved";
    case "pending":
    case "pending_review": return "Pending Safety Review";
    case "delivered": return "Delivered & Verified";
    case "rejected": return "Rejected";
    default: return status || "Unknown";
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toast(msg) {
  const box = document.getElementById("toast-box");
  if (!box) return;
  const item = document.createElement("div");
  item.className = "toast";
  item.innerText = msg;
  box.appendChild(item);
  setTimeout(() => {
    item.style.opacity = "0";
    item.style.transform = "translateY(8px)";
    setTimeout(() => item.remove(), 200);
  }, 2600);
}


document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("medbridge_theme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  const chatInput = document.getElementById("chat-input");
  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendChatMessage();
      }
    });
  }

  updateUserUI();
  regenerateDeliveryCode();

  renderHomeRecent();
  renderBrowseGrid();
  renderMyDonations();
  renderPendingReview();
  renderLiveInventory();
  renderAdminOrgs();
  renderWishlist();
  populateEditSelect();
  renderAuditLog();
  renderChat();
  updateImpactStats();

  checkBackendHealth();
});