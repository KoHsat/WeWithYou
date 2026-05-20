const STORAGE_KEYS = {
  users: "wwy-users",
  currentUserId: "wwy-current-user-id",
  contributionRequests: "wwy-contribution-requests",
  redemptions: "wwy-redemptions"
};

const OWNER_EMAIL = "owner@wewithyou.org";
const OWNER_PASSWORD = "Owner123!";
const CONTACT_EMAIL = "hsatmyomyatzay@gmail.com";
const FORMS_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
const REMOTE_APPLICATIONS_ENDPOINT = "/api/applications";
const REMOTE_CONTRIBUTIONS_ENDPOINT = "/api/contributions";

const CONTRIBUTION_CATALOG = [
  {
    id: "cleanup-drive",
    title: "Neighbourhood Cleanup Drive",
    points: 100,
    description:
      "Join our team to clean public walkways, collect litter, and help keep the learning route safe and welcoming for students.",
    time: "Saturday, 9:00 AM - 12:00 PM",
    place: "Taman Harmoni Community Hall, Kuala Lumpur",
    details: [
      "Gloves, rubbish bags, and cleanup tools are provided on site.",
      "Participants will be assigned small zones and a coordinator will verify completion.",
      "Please wear comfortable clothes, covered shoes, and bring a refillable water bottle."
    ]
  },
  {
    id: "study-kit-packing",
    title: "Offline Study Kit Packing Session",
    points: 80,
    description:
      "Help us prepare USB learning kits, printed notes, and assignment packs that will be delivered through the Mobile Hub.",
    time: "Wednesday, 2:00 PM - 5:00 PM",
    place: "We With You Storage Room, Sentul",
    details: [
      "Tasks include labeling USBs, packing worksheets, and checking kit completeness.",
      "A short orientation will explain how materials are grouped by subject and school level.",
      "Accuracy matters because each kit is distributed directly to students who rely on offline access."
    ]
  },
  {
    id: "elder-tech-help",
    title: "Community Digital Help Desk",
    points: 120,
    description:
      "Support older residents and parents with basic digital tasks such as filling forms, checking messages, or learning to use education platforms.",
    time: "Friday, 4:00 PM - 7:00 PM",
    place: "Flat Seri Murni Multipurpose Room",
    details: [
      "Volunteers help one-to-one under the supervision of a community coordinator.",
      "You do not need to be a technical expert, but patience and clear communication are important.",
      "This activity helps families become more confident in supporting students at home."
    ]
  },
  {
    id: "mobile-hub-support",
    title: "Mobile Hub Setup and Student Support",
    points: 150,
    description:
      "Assist the Mobile Hub team by setting up the van, guiding students to available devices, and helping organize the learning space.",
    time: "Sunday, 10:00 AM - 3:00 PM",
    place: "PPR Batu Muda Open Court",
    details: [
      "Volunteers help manage seating, device sharing, and orderly access to the WiFi queue.",
      "You may also help distribute timetables, notes, and sign-up forms to new families.",
      "A team lead will verify your contribution after the session ends."
    ]
  }
];

const REWARD_CATALOG = [
  {
    id: "m365-discount",
    title: "Microsoft 365 Discount Code",
    category: "Software Discount",
    points: 80,
    description: "Redeem a promo code for productivity apps used for assignments, reports, and presentations."
  },
  {
    id: "canva-discount",
    title: "Canva Pro Student Discount",
    category: "Software Discount",
    points: 70,
    description: "Unlock a discount for Canva tools that help with slides, posters, and creative coursework."
  },
  {
    id: "offline-usb",
    title: "32GB Learning USB Kit",
    category: "Offline Learning Tool",
    points: 120,
    description: "Redeem a USB kit prepared with space for lecture recordings, notes, and assignment files."
  },
  {
    id: "router-device",
    title: "Portable WiFi Router",
    category: "Digital Device",
    points: 260,
    description: "Use your points toward a pocket router that can support learning access while travelling."
  },
  {
    id: "tablet-device",
    title: "Refurbished Learning Tablet",
    category: "Digital Device",
    points: 420,
    description: "Redeem a study-ready tablet suitable for notes, online classes, and reading learning materials."
  },
  {
    id: "laptop-device",
    title: "Refurbished Student Laptop",
    category: "Digital Device",
    points: 650,
    description: "A larger redemption option for members who have consistently contributed to the community."
  }
];

const SEED_USERS = [
  {
    id: "owner-1",
    role: "owner",
    status: "approved",
    name: "We With You Admin",
    email: OWNER_EMAIL,
    phone: "01100000000",
    password: OWNER_PASSWORD,
    age: 34,
    location: "Kuala Lumpur",
    photoName: "",
    photoDataUrl: "",
    proofName: "Owner verification on file",
    points: 0,
    createdAt: "2026-05-01T09:00:00.000Z"
  },
  {
    id: "member-1",
    role: "member",
    status: "approved",
    name: "Alya Rahman",
    email: "alya@example.com",
    phone: "0123456789",
    password: "Member123!",
    age: 19,
    location: "Sentul, Kuala Lumpur",
    photoName: "",
    photoDataUrl: "",
    proofName: "Approved by admin",
    points: 180,
    createdAt: "2026-05-02T10:00:00.000Z"
  }
];

const SEED_REQUESTS = [
  {
    id: "request-approved-1",
    userId: "member-1",
    contributionId: "cleanup-drive",
    status: "approved",
    claimed: false,
    requestedAt: "2026-05-03T08:30:00.000Z",
    reviewedAt: "2026-05-03T12:00:00.000Z"
  },
  {
    id: "request-pending-1",
    userId: "member-1",
    contributionId: "study-kit-packing",
    status: "pending",
    claimed: false,
    requestedAt: "2026-05-10T09:30:00.000Z",
    reviewedAt: ""
  }
];

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedAppData() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    writeStore(STORAGE_KEYS.users, SEED_USERS);
  }

  if (!localStorage.getItem(STORAGE_KEYS.contributionRequests)) {
    writeStore(STORAGE_KEYS.contributionRequests, SEED_REQUESTS);
  }

  if (!localStorage.getItem(STORAGE_KEYS.redemptions)) {
    writeStore(STORAGE_KEYS.redemptions, []);
  }

  ensureOwnerAccount();
}

function ensureOwnerAccount() {
  const users = getUsers();
  const owner = users.find((user) => user.id === "owner-1" || user.role === "owner");

  if (!owner) {
    users.unshift({ ...SEED_USERS[0] });
    setUsers(users);
    return;
  }

  owner.id = "owner-1";
  owner.role = "owner";
  owner.status = "approved";
  owner.email = OWNER_EMAIL;
  owner.password = OWNER_PASSWORD;
  owner.name = owner.name || "We With You Admin";
  owner.location = owner.location || "Kuala Lumpur";
  owner.phone = owner.phone || "01100000000";
  setUsers(users);
}

function getUsers() {
  return readStore(STORAGE_KEYS.users, []);
}

function setUsers(users) {
  writeStore(STORAGE_KEYS.users, users);
}

function canUseRemoteApplications() {
  return window.location.protocol === "http:" || window.location.protocol === "https:";
}

function normalizeIdentifier(value) {
  return String(value || "").trim().toLowerCase();
}

function usersMatchByIdentity(firstUser, secondUser) {
  if (firstUser.id && secondUser.id && firstUser.id === secondUser.id) return true;

  const firstEmail = normalizeIdentifier(firstUser.email);
  const secondEmail = normalizeIdentifier(secondUser.email);
  if (firstEmail && firstEmail === secondEmail) return true;

  const firstPhone = normalizeIdentifier(firstUser.phone);
  const secondPhone = normalizeIdentifier(secondUser.phone);
  return Boolean(firstPhone && firstPhone === secondPhone);
}

function mergeRemoteUsers(remoteUsers) {
  if (!Array.isArray(remoteUsers)) return;

  const users = getUsers();

  remoteUsers.forEach((remoteUser) => {
    if (!remoteUser || remoteUser.role === "owner") return;

    const existingIndex = users.findIndex((user) => usersMatchByIdentity(user, remoteUser));

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...remoteUser };
    } else {
      users.push(remoteUser);
    }
  });

  setUsers(users);
}

async function syncRemoteApplications() {
  if (!canUseRemoteApplications()) return false;

  try {
    const response = await fetch(REMOTE_APPLICATIONS_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!response.ok) return false;

    const data = await response.json();
    mergeRemoteUsers(data.users);
    return true;
  } catch (error) {
    return false;
  }
}

async function createRemoteApplication(user) {
  if (!canUseRemoteApplications()) return false;

  try {
    const response = await fetch(REMOTE_APPLICATIONS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ user })
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.user) mergeRemoteUsers([data.user]);
    return true;
  } catch (error) {
    return false;
  }
}

async function updateRemoteApplicationStatus(userId, nextStatus) {
  if (!canUseRemoteApplications()) return false;

  try {
    const response = await fetch(REMOTE_APPLICATIONS_ENDPOINT, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ id: userId, status: nextStatus })
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.user) mergeRemoteUsers([data.user]);
    return true;
  } catch (error) {
    return false;
  }
}

function getContributionRequests() {
  return readStore(STORAGE_KEYS.contributionRequests, []);
}

function setContributionRequests(requests) {
  writeStore(STORAGE_KEYS.contributionRequests, requests);
}

function mergeRemoteContributions(remoteRequests) {
  if (!Array.isArray(remoteRequests)) return;
  const local = getContributionRequests();
  remoteRequests.forEach((remote) => {
    const idx = local.findIndex((r) => r.id === remote.id);
    if (idx >= 0) {
      // Remote status always wins so owner approvals sync back
      local[idx] = { ...local[idx], ...remote };
    } else {
      local.push(remote);
    }
  });
  setContributionRequests(local);
}

async function syncRemoteContributions() {
  if (!canUseRemoteApplications()) return false;
  try {
    const response = await fetch(REMOTE_CONTRIBUTIONS_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return false;
    const data = await response.json();
    mergeRemoteContributions(data.requests);
    return true;
  } catch { return false; }
}

async function pushRemoteContribution(request) {
  if (!canUseRemoteApplications()) return false;
  try {
    const response = await fetch(REMOTE_CONTRIBUTIONS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ request })
    });
    if (!response.ok) return false;
    const data = await response.json();
    if (data.request) mergeRemoteContributions([data.request]);
    return true;
  } catch { return false; }
}

async function updateRemoteContributionStatus(requestId, nextStatus) {
  if (!canUseRemoteApplications()) return false;
  try {
    const response = await fetch(REMOTE_CONTRIBUTIONS_ENDPOINT, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: requestId, status: nextStatus })
    });
    if (!response.ok) return false;
    return true;
  } catch { return false; }
}

function getRedemptions() {
  return readStore(STORAGE_KEYS.redemptions, []);
}

function setRedemptions(redemptions) {
  writeStore(STORAGE_KEYS.redemptions, redemptions);
}

function getCurrentUser() {
  const currentUserId = localStorage.getItem(STORAGE_KEYS.currentUserId);
  if (!currentUserId) return null;
  return getUsers().find((user) => user.id === currentUserId) || null;
}

function setCurrentUser(userId) {
  localStorage.setItem(STORAGE_KEYS.currentUserId, userId);
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUserId);
}

function getUserLabel(user) {
  return user.name || user.email || user.phone || "Member";
}

function getUserInitials(user) {
  const parts = getUserLabel(user).trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "WW";
}

function getContributionById(id) {
  return CONTRIBUTION_CATALOG.find((item) => item.id === id);
}

function getRewardById(id) {
  return REWARD_CATALOG.find((item) => item.id === id);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(dateString));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function findUserByIdentifier(identifier) {
  const cleanIdentifier = identifier.trim().toLowerCase();
  return getUsers().find((user) => {
    const email = user.email ? user.email.toLowerCase() : "";
    const phone = user.phone ? user.phone.toLowerCase() : "";
    return email === cleanIdentifier || phone === cleanIdentifier;
  });
}

function getPendingNotificationCount() {
  const pendingUsers = getUsers().filter((user) => user.status === "pending").length;
  const pendingContributionRequests = getContributionRequests().filter((request) => request.status === "pending").length;
  return pendingUsers + pendingContributionRequests;
}

function isOwner(user) {
  return Boolean(user && user.role === "owner" && user.status === "approved" && user.email === OWNER_EMAIL);
}

function getModalRoot() {
  let modalRoot = document.getElementById("app-modal-root");

  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.id = "app-modal-root";
    document.body.appendChild(modalRoot);
  }

  return modalRoot;
}

function closeModal() {
  const modalRoot = getModalRoot();
  modalRoot.innerHTML = "";
  modalRoot.classList.remove("is-open");
}

function openModal({ title, message, actions = [] }) {
  const modalRoot = getModalRoot();
  modalRoot.classList.add("is-open");

  const buttonsMarkup = actions
    .map((action, index) => {
      const kind = action.kind || "secondary";
      return `<button class="modal-button modal-button-${kind}" type="button" data-modal-action="${index}">${action.label}</button>`;
    })
    .join("");

  modalRoot.innerHTML = `
    <div class="app-modal-backdrop" data-modal-close="true"></div>
    <div class="app-modal" role="dialog" aria-modal="true" aria-label="${title}">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="modal-actions">${buttonsMarkup}</div>
    </div>
  `;

  modalRoot.querySelectorAll("[data-modal-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedAction = actions[Number(button.dataset.modalAction)];
      closeModal();
      if (selectedAction?.onClick) {
        selectedAction.onClick();
      }
    });
  });

  modalRoot.querySelectorAll("[data-modal-close]").forEach((node) => {
    node.addEventListener("click", closeModal);
  });
}

function initNavigation() {
  document.querySelectorAll(".nav-row").forEach((navRow) => {
    const toggle = navRow.querySelector(".nav-toggle");
    const panel = navRow.querySelector(".nav-panel");

    if (toggle && panel) {
      const closeMenu = () => {
        navRow.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      };

      toggle.addEventListener("click", () => {
        const isOpen = navRow.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });

      panel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 1024) {
            closeMenu();
          }
        });
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
          closeMenu();
        }
      });

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeMenu();
        }
      });
    }
  });
}

function updateJoinProgramLinks() {
  document.querySelectorAll(".nav-cta, [data-join-program]").forEach((link) => {
    link.setAttribute("href", "sign-in.html");
  });
}

function injectOwnerReviewLink() {
  const footerRow = document.querySelector(".footer-row");
  if (!footerRow) return;

  const existing = footerRow.querySelector(".owner-review-slot");
  if (existing) existing.remove();

  const currentUser = getCurrentUser();
  if (!isOwner(currentUser)) return;

  const pendingCount = getPendingNotificationCount();

  const wrapper = document.createElement("div");
  wrapper.className = "owner-review-slot";

  wrapper.innerHTML = `
    <a class="owner-review-link" href="owner-review.html">
      Owner Review
      ${pendingCount > 0 ? `<span class="notification-badge">${pendingCount}</span>` : ""}
    </a>
  `;

  footerRow.appendChild(wrapper);
}

async function sendFormToOwner(formData, subject) {
  const payload = new FormData();

  formData.forEach((value, key) => {
    payload.append(key, value);
  });

  payload.append("_subject", subject);
  payload.append("_captcha", "false");
  payload.append("_template", "table");

  const response = await fetch(FORMS_ENDPOINT, {
    method: "POST",
    body: payload,
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Remote form submission failed");
  }

  return response.json().catch(() => ({}));
}

function signOut() {
  clearCurrentUser();
  window.location.href = "index.html";
}

function guardOwnerReviewPage() {
  if (!document.getElementById("owner-stats")) return true;

  const currentUser = getCurrentUser();
  if (isOwner(currentUser)) return true;

  window.location.href = "sign-in.html";
  return false;
}

function renderMemberBanner(rootId, options = {}) {
  const root = document.getElementById(rootId);
  if (!root) return null;

  const currentUser = getCurrentUser();
  const approvedMember = currentUser && currentUser.status === "approved" && currentUser.role === "member";

  if (!approvedMember) {
    root.innerHTML = `
      <div class="member-banner guest-banner">
        <div>
          <h3>${options.guestTitle || "Sign in to continue"}</h3>
          <p>${options.guestMessage || "You need an approved member account to access this section."}</p>
        </div>
        <div class="guest-actions">
          <a class="button button-primary" href="sign-in.html">Sign In / Sign Up</a>
        </div>
      </div>
    `;
    return null;
  }

  const photoMarkup = currentUser.photoDataUrl
    ? `<img src="${currentUser.photoDataUrl}" alt="${getUserLabel(currentUser)} profile photo">`
    : `<span>${getUserInitials(currentUser)}</span>`;

  root.innerHTML = `
    <div class="member-banner">
      <div class="member-profile">
        <div class="member-avatar">${photoMarkup}</div>
        <div class="member-meta">
          <p class="member-overline">Member profile</p>
          <h3>${getUserLabel(currentUser)}</h3>
          <p>${currentUser.location || "Community member"} · ${currentUser.email || currentUser.phone}</p>
        </div>
      </div>
      <div class="points-overview">
        <p class="member-overline">Total points</p>
        <div class="points-total-wrap">
          <span class="points-delta-stack" id="${rootId}-delta"></span>
          <strong id="${rootId}-total">${currentUser.points}</strong>
        </div>
        <div class="member-quick-actions">
          <a class="button button-secondary compact-button" href="points.html">Point History</a>
          <button class="button button-secondary compact-button" type="button" data-sign-out="true">Sign Out</button>
        </div>
      </div>
    </div>
  `;

  root.querySelector("[data-sign-out='true']")?.addEventListener("click", signOut);
  return { user: currentUser, totalId: `${rootId}-total`, deltaId: `${rootId}-delta` };
}

function animatePointsChange(deltaId, totalId, amount) {
  const totalNode = document.getElementById(totalId);
  const deltaStack = document.getElementById(deltaId);
  const currentUser = getCurrentUser();

  if (!totalNode || !deltaStack || !currentUser) return;

  totalNode.textContent = currentUser.points;

  const pill = document.createElement("span");
  pill.className = `points-delta ${amount >= 0 ? "positive" : "negative"}`;
  pill.textContent = `${amount >= 0 ? "+" : ""}${amount}`;
  deltaStack.appendChild(pill);

  setTimeout(() => {
    pill.remove();
  }, 1500);
}

function statusLabel(status) {
  if (status === "approved") return "Approved";
  if (status === "pending") return "Pending Review";
  if (status === "denied") return "Denied";
  return status;
}

function renderContributionPage() {
  const root = document.getElementById("contribution-opportunities");
  if (!root) return;

  const banner = renderMemberBanner("member-banner-root", {
    guestTitle: "Sign in before you engage in a community contribution",
    guestMessage: "Approved members can request activities here and the We With You team can review them from the owner review page."
  });

  const currentUser = banner?.user || null;
  const requests = getContributionRequests();

  root.innerHTML = CONTRIBUTION_CATALOG.map((item) => {
    const userRequest = currentUser
      ? requests.find((request) => request.userId === currentUser.id && request.contributionId === item.id)
      : null;

    const requestStatus = userRequest ? userRequest.status : "";
    const requestLabel = requestStatus ? statusLabel(requestStatus) : "Open for engagement";
    const buttonLabel =
      requestStatus === "pending"
        ? "Pending Review"
        : requestStatus === "approved"
          ? userRequest.claimed
            ? "Completed"
            : "Approved"
          : requestStatus === "denied"
            ? "Engage Again"
            : "Engage";

    return `
      <article class="card contribution-card">
        <div class="contribution-card-head">
          <div>
            <span class="point-pill">${item.points} pts</span>
            <h3>${item.title}</h3>
          </div>
          <span class="status-chip ${requestStatus || "open"}">${requestLabel}</span>
        </div>
        <p>${item.description}</p>
        <div class="detail-list">
          <div><strong>Time</strong><span>${item.time}</span></div>
          <div><strong>Place</strong><span>${item.place}</span></div>
        </div>
        <ul>
          ${item.details.map((detail) => `<li>${detail}</li>`).join("")}
        </ul>
        <div class="card-actions">
          <button class="button button-primary compact-button" type="button" data-engage="${item.id}" ${requestStatus === "pending" || requestStatus === "approved" ? "disabled" : ""}>
            ${buttonLabel}
          </button>
        </div>
      </article>
    `;
  }).join("");

  root.querySelectorAll("[data-engage]").forEach((button) => {
    button.addEventListener("click", () => handleEngageRequest(button.dataset.engage));
  });
}

function handleEngageRequest(contributionId) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    openModal({
      title: "Sign in required",
      message: "You can't participate unless you are signed-in.",
      actions: [
        { label: "No", kind: "secondary" },
        { label: "Sign In", kind: "primary", onClick: () => { window.location.href = "sign-in.html"; } }
      ]
    });
    return;
  }

  if (currentUser.status !== "approved") {
    openModal({
      title: "Account pending approval",
      message: "Your sign-up has been submitted. Please wait 1 to 2 working days for approval before joining an activity.",
      actions: [{ label: "Okay", kind: "primary" }]
    });
    return;
  }

  if (currentUser.role !== "member") {
    openModal({
      title: "Member access only",
      message: "Contribution requests are meant for approved community members.",
      actions: [{ label: "Okay", kind: "primary" }]
    });
    return;
  }

  const requests = getContributionRequests();
  const existing = requests.find((request) => request.userId === currentUser.id && request.contributionId === contributionId);

  if (existing && (existing.status === "pending" || existing.status === "approved")) {
    openModal({
      title: "Already submitted",
      message: "This contribution has already been submitted for review or approved.",
      actions: [{ label: "Okay", kind: "primary" }]
    });
    return;
  }

  const filtered = requests.filter((request) => !(request.userId === currentUser.id && request.contributionId === contributionId));

  const newRequest = {
    id: createId("request"),
    userId: currentUser.id,
    contributionId,
    status: "pending",
    claimed: false,
    requestedAt: new Date().toISOString(),
    reviewedAt: ""
  };

  filtered.push(newRequest);
  setContributionRequests(filtered);
  pushRemoteContribution(newRequest);
  injectOwnerReviewLink();
  renderContributionPage();

  openModal({
    title: "Contribution request submitted",
    message: "Your participation request has been sent for approval. The owner review page now shows a new notification for this request.",
    actions: [{ label: "Great", kind: "primary" }]
  });
}

async function renderPointsPage() {
  const listRoot = document.getElementById("points-activity-list");
  if (!listRoot) return;

  const banner = renderMemberBanner("member-banner-root", {
    guestTitle: "Sign in to view your point history",
    guestMessage: "Approved members can see their activity history here and claim points after a contribution is approved."
  });

  if (!banner) {
    listRoot.innerHTML = "";
    return;
  }

  // Sync from remote so owner approvals appear without a page reload
  await syncRemoteContributions();

  const requests = getContributionRequests()
    .filter((request) => request.userId === banner.user.id)
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  if (!requests.length) {
    listRoot.innerHTML = `<div class="empty-state">No contribution activity yet. Visit the contribution page to engage in a community task.</div>`;
    return;
  }

  listRoot.innerHTML = requests.map((request) => {
    const contribution = getContributionById(request.contributionId);
    const canClaim = request.status === "approved" && !request.claimed;

    return `
      <article class="activity-row card">
        <div class="activity-main">
          <div>
            <h3>${contribution.title}</h3>
            <p>${contribution.place}</p>
          </div>
          <div class="activity-meta">
            <span>${contribution.points} pts</span>
            <span>${formatDate(request.requestedAt)}</span>
          </div>
        </div>
        <div class="activity-footer">
          <span class="status-chip ${request.status}">${statusLabel(request.status)}</span>
          <button class="button ${canClaim ? "button-primary" : "button-secondary"} compact-button" type="button" data-claim="${request.id}" ${canClaim ? "" : "disabled"}>
            ${request.claimed ? "Claimed" : "Claim"}
          </button>
        </div>
      </article>
    `;
  }).join("");

  listRoot.querySelectorAll("[data-claim]").forEach((button) => {
    button.addEventListener("click", () => handleClaimPoints(button.dataset.claim, banner));
  });
}

function handleClaimPoints(requestId, banner) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const requests = getContributionRequests();
  const request = requests.find((item) => item.id === requestId && item.userId === currentUser.id);
  if (!request || request.status !== "approved" || request.claimed) return;

  const contribution = getContributionById(request.contributionId);
  request.claimed = true;

  const users = getUsers();
  const user = users.find((item) => item.id === currentUser.id);
  user.points += contribution.points;

  setContributionRequests(requests);
  setUsers(users);
  animatePointsChange(banner.deltaId, banner.totalId, contribution.points);
  renderPointsPage();
}

function renderRewardsPage() {
  const storeRoot = document.getElementById("reward-store-grid");
  if (!storeRoot) return;

  const banner = renderMemberBanner("member-banner-root", {
    guestTitle: "Sign in to redeem rewards",
    guestMessage: "Approved members can see their total points here and redeem software discounts, tools, and devices."
  });

  const recentRoot = document.getElementById("recent-redemptions");

  storeRoot.innerHTML = REWARD_CATALOG.map((item) => {
    const enoughPoints = banner?.user ? banner.user.points >= item.points : false;

    return `
      <article class="card reward-card">
        <span class="status-chip open">${item.category}</span>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="reward-card-footer">
          <strong>${item.points} pts</strong>
          <button class="button ${enoughPoints ? "button-primary" : "button-secondary"} compact-button" type="button" data-redeem="${item.id}">
            Redeem
          </button>
        </div>
      </article>
    `;
  }).join("");

  storeRoot.querySelectorAll("[data-redeem]").forEach((button) => {
    button.addEventListener("click", () => handleRedeem(button.dataset.redeem, banner));
  });

  if (!recentRoot) return;

  if (!banner) {
    recentRoot.innerHTML = "";
    return;
  }

  const recentItems = getRedemptions()
    .filter((item) => item.userId === banner.user.id)
    .sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt))
    .slice(0, 4);

  recentRoot.innerHTML = recentItems.length
    ? recentItems.map((entry) => {
        const reward = getRewardById(entry.rewardId);
        return `
          <article class="card reward-history-card">
            <h3>${reward.title}</h3>
            <p>${formatDate(entry.redeemedAt)} · ${entry.pointsUsed} pts used</p>
          </article>
        `;
      }).join("")
    : `<div class="empty-state">No rewards redeemed yet. When you redeem an item, it will appear here.</div>`;
}

function handleRedeem(rewardId, banner) {
  const currentUser = getCurrentUser();
  if (!currentUser || !banner) {
    openModal({
      title: "Sign in required",
      message: "Please sign in with an approved account before redeeming rewards.",
      actions: [
        { label: "No", kind: "secondary" },
        { label: "Sign In", kind: "primary", onClick: () => { window.location.href = "sign-in.html"; } }
      ]
    });
    return;
  }

  const reward = getRewardById(rewardId);
  if (currentUser.points < reward.points) {
    openModal({
      title: "Not enough points",
      message: `You need ${reward.points} points to redeem ${reward.title}. Keep contributing and claim more approved activities.`,
      actions: [{ label: "Okay", kind: "primary" }]
    });
    return;
  }

  const users = getUsers();
  const user = users.find((item) => item.id === currentUser.id);
  user.points -= reward.points;
  setUsers(users);

  const redemptions = getRedemptions();
  redemptions.push({
    id: createId("redeem"),
    userId: currentUser.id,
    rewardId,
    pointsUsed: reward.points,
    redeemedAt: new Date().toISOString()
  });
  setRedemptions(redemptions);

  animatePointsChange(banner.deltaId, banner.totalId, -reward.points);
  renderRewardsPage();
}

async function renderOwnerReviewPage() {
  const membershipRoot = document.getElementById("membership-queue");
  const contributionRoot = document.getElementById("contribution-queue");
  const statsRoot = document.getElementById("owner-stats");
  if (!membershipRoot || !contributionRoot || !statsRoot) return;

  if (!guardOwnerReviewPage()) return;

  statsRoot.innerHTML = `
    <article class="card owner-stat-card">
      <p>Syncing pending approvals</p>
      <strong>...</strong>
    </article>
  `;
  membershipRoot.innerHTML = `<div class="empty-state">Loading pending sign-up approvals...</div>`;
  contributionRoot.innerHTML = `<div class="empty-state">Loading pending contribution approvals...</div>`;

  const remoteSynced = await syncRemoteApplications();
  await syncRemoteContributions();
  const users = getUsers();
  const requests = getContributionRequests();

  const pendingUsers = users.filter((user) => user.status === "pending");
  const pendingRequests = requests.filter((request) => request.status === "pending");

  document.title = pendingUsers.length + pendingRequests.length > 0
    ? `(${pendingUsers.length + pendingRequests.length}) Owner Review | We With You`
    : "Owner Review | We With You";

  statsRoot.innerHTML = `
    <article class="card owner-stat-card">
      <p>Pending sign-up approvals</p>
      <strong>${pendingUsers.length}</strong>
    </article>
    <article class="card owner-stat-card">
      <p>Pending contribution approvals</p>
      <strong>${pendingRequests.length}</strong>
    </article>
    <article class="card owner-stat-card">
      <p>Total stored members</p>
      <strong>${users.filter((user) => user.role === "member").length}</strong>
    </article>
    <article class="card owner-stat-card">
      <p>Signup sync</p>
      <strong>${remoteSynced ? "Online" : "Local"}</strong>
    </article>
  `;

  membershipRoot.innerHTML = pendingUsers.length
    ? pendingUsers.map((user) => `
        <article class="card queue-card">
          <div class="queue-card-head">
            <div>
              <h3>${user.name}</h3>
              <p>${user.email || user.phone}</p>
            </div>
            <span class="status-chip pending">Pending member review</span>
          </div>
          <div class="detail-list">
            <div><strong>Age</strong><span>${user.age}</span></div>
            <div><strong>Location</strong><span>${user.location}</span></div>
            <div><strong>Photo</strong><span>${user.photoName || "Uploaded"}</span></div>
            <div><strong>Proof</strong><span>${user.proofName || "Uploaded"}</span></div>
          </div>
          <div class="card-actions">
            <button class="button button-primary compact-button" type="button" data-approve-user="${user.id}">Approve</button>
            <button class="button button-secondary compact-button" type="button" data-deny-user="${user.id}">Deny</button>
          </div>
        </article>
      `).join("")
    : `<div class="empty-state">No pending sign-up requests right now.</div>`;

  contributionRoot.innerHTML = pendingRequests.length
    ? pendingRequests.map((request) => {
        const user = users.find((item) => item.id === request.userId);
        const contribution = getContributionById(request.contributionId);

        return `
          <article class="card queue-card">
            <div class="queue-card-head">
              <div>
                <h3>${contribution.title}</h3>
                <p>${getUserLabel(user)} · ${user.email || user.phone}</p>
              </div>
              <span class="status-chip pending">Pending activity review</span>
            </div>
            <div class="detail-list">
              <div><strong>Points</strong><span>${contribution.points}</span></div>
              <div><strong>Time</strong><span>${contribution.time}</span></div>
              <div><strong>Place</strong><span>${contribution.place}</span></div>
              <div><strong>Requested</strong><span>${formatDate(request.requestedAt)}</span></div>
            </div>
            <p>${contribution.description}</p>
            <div class="card-actions">
              <button class="button button-primary compact-button" type="button" data-approve-request="${request.id}">Approve</button>
              <button class="button button-secondary compact-button" type="button" data-deny-request="${request.id}">Deny</button>
            </div>
          </article>
        `;
      }).join("")
    : `<div class="empty-state">No pending contribution approvals right now.</div>`;

  membershipRoot.querySelectorAll("[data-approve-user]").forEach((button) => {
    button.addEventListener("click", () => updateUserApproval(button.dataset.approveUser, "approved"));
  });
  membershipRoot.querySelectorAll("[data-deny-user]").forEach((button) => {
    button.addEventListener("click", () => updateUserApproval(button.dataset.denyUser, "denied"));
  });
  contributionRoot.querySelectorAll("[data-approve-request]").forEach((button) => {
    button.addEventListener("click", () => updateContributionApproval(button.dataset.approveRequest, "approved"));
  });
  contributionRoot.querySelectorAll("[data-deny-request]").forEach((button) => {
    button.addEventListener("click", () => updateContributionApproval(button.dataset.denyRequest, "denied"));
  });
}

async function updateUserApproval(userId, nextStatus) {
  const users = getUsers();
  const user = users.find((item) => item.id === userId);
  if (!user) return;

  user.status = nextStatus;
  setUsers(users);
  await updateRemoteApplicationStatus(userId, nextStatus);
  injectOwnerReviewLink();
  renderOwnerReviewPage();
}

function updateContributionApproval(requestId, nextStatus) {
  const requests = getContributionRequests();
  const request = requests.find((item) => item.id === requestId);
  if (!request) return;

  request.status = nextStatus;
  request.reviewedAt = new Date().toISOString();
  setContributionRequests(requests);
  updateRemoteContributionStatus(requestId, nextStatus);
  injectOwnerReviewLink();
  renderOwnerReviewPage();
}

function toggleAuthMethod() {
  const tabs = document.querySelectorAll("[data-auth-method]");
  const methodInput = document.getElementById("auth-method");
  const emailField = document.getElementById("signup-email-field");
  const phoneField = document.getElementById("signup-phone-field");

  if (!tabs.length || !methodInput || !emailField || !phoneField) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const method = tab.dataset.authMethod;
      methodInput.value = method;

      tabs.forEach((node) => node.classList.toggle("active", node === tab));
      emailField.classList.toggle("hidden", method !== "email");
      phoneField.classList.toggle("hidden", method !== "phone");
    });
  });
}

function readPhotoPreview(file) {
  if (!file || !file.type.startsWith("image/")) {
    return Promise.resolve("");
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function initAuthPage() {
  const signInForm = document.getElementById("sign-in-form");
  const signUpForm = document.getElementById("sign-up-form");
  const currentStatusRoot = document.getElementById("current-session-status");

  if (currentStatusRoot) {
    const currentUser = getCurrentUser();
    currentStatusRoot.innerHTML = currentUser
      ? `
        <div class="status-panel">
          <p class="member-overline">Current session</p>
          <h3>${getUserLabel(currentUser)}</h3>
          <p>${currentUser.status === "approved" ? "You are already signed in." : "Your account is still waiting for approval."}</p>
          <div class="member-quick-actions">
            <a class="button button-secondary compact-button" href="${isOwner(currentUser) ? "owner-review.html" : "points.html"}">Open Dashboard</a>
            <button class="button button-secondary compact-button" type="button" id="auth-sign-out">Sign Out</button>
          </div>
        </div>
      `
      : `
        <div class="status-panel">
          <p class="member-overline">Profile information</p>
          <h3>No active session</h3>
          <p>Sign in to access points, contributions, and rewards. New applicants can submit a sign-up request for owner approval.</p>
        </div>
      `;

    currentStatusRoot.querySelector("#auth-sign-out")?.addEventListener("click", signOut);
  }

  if (!signInForm && !signUpForm) return;

  toggleAuthMethod();

  signInForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(signInForm);
    const identifier = String(formData.get("identifier") || "").trim();
    const password = String(formData.get("password") || "");

    await syncRemoteApplications();
    const matchedUser = findUserByIdentifier(identifier);
    if (!matchedUser || matchedUser.password !== password) {
      openModal({
        title: "Sign-in failed",
        message: "The email or phone number and password do not match our records.",
        actions: [{ label: "Try Again", kind: "primary" }]
      });
      return;
    }

    if (matchedUser.status === "pending") {
      openModal({
        title: "Application still under review",
        message: "Everything has been submitted. The approval process takes 1 to 2 working days before you can sign in.",
        actions: [{ label: "Okay", kind: "primary" }]
      });
      return;
    }

    if (matchedUser.status === "denied") {
      openModal({
        title: "Application not approved",
        message: "Your account is currently not approved. Please contact We With You if you believe this is a mistake.",
        actions: [{ label: "Okay", kind: "primary" }]
      });
      return;
    }

    setCurrentUser(matchedUser.id);
    window.location.href = isOwner(matchedUser) ? "owner-review.html" : "points.html";
  });

  signUpForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(signUpForm);
    const method = String(formData.get("auth-method") || "email");
    const email = method === "email" ? String(formData.get("email") || "").trim() : "";
    const phone = method === "phone" ? String(formData.get("phone") || "").trim() : "";
    const password = String(formData.get("signup-password") || "");
    const confirmPassword = String(formData.get("confirm-password") || "");

    if ((method === "email" && !email) || (method === "phone" && !phone)) {
      openModal({
        title: "Missing contact method",
        message: `Please enter your ${method === "email" ? "email address" : "phone number"} before submitting the application.`,
        actions: [{ label: "Okay", kind: "primary" }]
      });
      return;
    }

    if (password !== confirmPassword) {
      openModal({
        title: "Password mismatch",
        message: "Please make sure your password and confirm password fields match.",
        actions: [{ label: "Okay", kind: "primary" }]
      });
      return;
    }

    await syncRemoteApplications();
    const users = getUsers();
    const duplicate = users.find((user) => {
      if (email && user.email?.toLowerCase() === email.toLowerCase()) return true;
      if (phone && user.phone === phone) return true;
      return false;
    });

    if (duplicate) {
      openModal({
        title: "Identifier already used",
        message: "That email or phone number is already registered. Please sign in instead or use a different one.",
        actions: [{ label: "Okay", kind: "primary" }]
      });
      return;
    }

    const photoFile = formData.get("photo");
    const proofFile = formData.get("proof");
    const photoDataUrl = await readPhotoPreview(photoFile);

    const newUser = {
      id: createId("user"),
      role: "member",
      status: "pending",
      name: String(formData.get("full-name") || "").trim(),
      email,
      phone,
      password,
      age: String(formData.get("age") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      photoName: photoFile && photoFile.name ? photoFile.name : "",
      photoDataUrl,
      proofName: proofFile && proofFile.name ? proofFile.name : "",
      points: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    setUsers(users);
    const remoteSaved = await createRemoteApplication(newUser);
    injectOwnerReviewLink();

    signUpForm.reset();
    document.getElementById("signup-email-field")?.classList.remove("hidden");
    document.getElementById("signup-phone-field")?.classList.add("hidden");
    document.querySelectorAll("[data-auth-method]").forEach((node) => {
      node.classList.toggle("active", node.dataset.authMethod === "email");
    });
    document.getElementById("auth-method").value = "email";

    openModal({
      title: "Application submitted",
      message: remoteSaved
        ? "Everything is submitted successfully. Your application will appear in the owner review page across devices, and the review process will take 1 to 2 working days before you can sign in."
        : "Everything is submitted successfully on this device. Cross-device owner review will work after the shared application database is connected on the deployed site.",
      actions: [{ label: "Okay", kind: "primary" }]
    });
  });
}

function initContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);

    try {
      await sendFormToOwner(formData, "New contact message from We With You website");
      contactForm.reset();
      openModal({
        title: "Message sent",
        message: `Your message has been sent to ${CONTACT_EMAIL}.`,
        actions: [{ label: "Okay", kind: "primary" }]
      });
    } catch (error) {
      openModal({
        title: "Message not sent",
        message: "The message could not be sent right now. Please check your internet connection and try again.",
        actions: [{ label: "Okay", kind: "primary" }]
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  seedAppData();
  initNavigation();
  updateJoinProgramLinks();
  injectOwnerReviewLink();
  initAuthPage();
  initContactForm();
  renderContributionPage();
  renderPointsPage();
  renderRewardsPage();
  renderOwnerReviewPage();
});
