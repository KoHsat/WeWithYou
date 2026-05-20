const APPLICATIONS_KEY = "wwy-member-applications";
const CONTRIBUTIONS_KEY = "wwy-contribution-requests";
const ALLOWED_STATUSES = new Set(["pending", "approved", "denied"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

function getStore(env) {
  return env.WWY_APPLICATIONS || env.KV;
}

async function readKey(env, key) {
  const store = getStore(env);
  if (!store) throw new Error("Missing KV binding");
  const raw = await store.get(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

async function writeKey(env, key, data) {
  const store = getStore(env);
  if (!store) throw new Error("Missing KV binding");
  await store.put(key, JSON.stringify(data));
}

function cleanText(value) { return String(value || "").trim(); }
function cleanEmail(value) { return cleanText(value).toLowerCase(); }

function sanitizeUser(input, fallbackStatus = "pending") {
  const s = input && typeof input === "object" ? input : {};
  const status = ALLOWED_STATUSES.has(s.status) ? s.status : fallbackStatus;
  return {
    id: cleanText(s.id) || `user-${Date.now()}`,
    role: "member", status,
    name: cleanText(s.name),
    email: cleanEmail(s.email),
    phone: cleanText(s.phone),
    password: String(s.password || ""),
    age: cleanText(s.age),
    location: cleanText(s.location),
    photoName: cleanText(s.photoName),
    photoDataUrl: String(s.photoDataUrl || ""),
    proofName: cleanText(s.proofName),
    points: Number(s.points) || 0,
    createdAt: cleanText(s.createdAt) || new Date().toISOString(),
    reviewedAt: cleanText(s.reviewedAt)
  };
}

function sanitizeRequest(input) {
  const s = input && typeof input === "object" ? input : {};
  const status = ALLOWED_STATUSES.has(s.status) ? s.status : "pending";
  return {
    id: cleanText(s.id) || `request-${Date.now()}`,
    userId: cleanText(s.userId),
    contributionId: cleanText(s.contributionId),
    status,
    claimed: Boolean(s.claimed),
    requestedAt: cleanText(s.requestedAt) || new Date().toISOString(),
    reviewedAt: cleanText(s.reviewedAt)
  };
}

function usersMatch(a, b) {
  if (a.id && b.id && a.id === b.id) return true;
  if (a.email && b.email && a.email === b.email) return true;
  return Boolean(a.phone && b.phone && a.phone === b.phone);
}

// --- /api/applications ---
async function handleApplicationsApi(request, env) {
  if (request.method === "OPTIONS") return json({ ok: true });

  if (request.method === "GET") {
    try {
      const users = await readKey(env, APPLICATIONS_KEY);
      return json({ users });
    } catch { return json({ error: "Sync not configured." }, 503); }
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();
      const incoming = sanitizeUser(body.user, "pending");
      incoming.status = "pending";
      if (!incoming.email && !incoming.phone)
        return json({ error: "Email or phone required." }, 400);
      const users = await readKey(env, APPLICATIONS_KEY);
      const idx = users.findIndex(u => usersMatch(u, incoming));
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...incoming, status: users[idx].status || "pending" };
        await writeKey(env, APPLICATIONS_KEY, users);
        return json({ user: users[idx] });
      }
      users.push(incoming);
      await writeKey(env, APPLICATIONS_KEY, users);
      return json({ user: incoming }, 201);
    } catch { return json({ error: "Could not save application." }, 500); }
  }

  if (request.method === "PATCH") {
    try {
      const body = await request.json();
      const id = cleanText(body.id);
      const status = cleanText(body.status);
      if (!id || !ALLOWED_STATUSES.has(status))
        return json({ error: "Valid id and status required." }, 400);
      const users = await readKey(env, APPLICATIONS_KEY);
      const user = users.find(u => u.id === id);
      if (!user) return json({ error: "Not found." }, 404);
      user.status = status;
      user.reviewedAt = new Date().toISOString();
      await writeKey(env, APPLICATIONS_KEY, users);
      return json({ user });
    } catch { return json({ error: "Could not update application." }, 500); }
  }

  return json({ error: "Method not allowed." }, 405);
}

// --- /api/contributions ---
async function handleContributionsApi(request, env) {
  if (request.method === "OPTIONS") return json({ ok: true });

  if (request.method === "GET") {
    try {
      const requests = await readKey(env, CONTRIBUTIONS_KEY);
      return json({ requests });
    } catch { return json({ error: "Sync not configured." }, 503); }
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();
      const incoming = sanitizeRequest(body.request);
      if (!incoming.userId || !incoming.contributionId)
        return json({ error: "userId and contributionId required." }, 400);
      const requests = await readKey(env, CONTRIBUTIONS_KEY);
      const idx = requests.findIndex(r => r.id === incoming.id);
      if (idx >= 0) {
        requests[idx] = { ...requests[idx], ...incoming };
        await writeKey(env, CONTRIBUTIONS_KEY, requests);
        return json({ request: requests[idx] });
      }
      requests.push(incoming);
      await writeKey(env, CONTRIBUTIONS_KEY, requests);
      return json({ request: incoming }, 201);
    } catch { return json({ error: "Could not save request." }, 500); }
  }

  if (request.method === "PATCH") {
    try {
      const body = await request.json();
      const id = cleanText(body.id);
      const status = cleanText(body.status);
      if (!id || !ALLOWED_STATUSES.has(status))
        return json({ error: "Valid id and status required." }, 400);
      const requests = await readKey(env, CONTRIBUTIONS_KEY);
      const req = requests.find(r => r.id === id);
      if (!req) return json({ error: "Not found." }, 404);
      req.status = status;
      req.reviewedAt = new Date().toISOString();
      await writeKey(env, CONTRIBUTIONS_KEY, requests);
      return json({ request: req });
    } catch { return json({ error: "Could not update request." }, 500); }
  }

  return json({ error: "Method not allowed." }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/applications")
      return handleApplicationsApi(request, env);
    if (url.pathname === "/api/contributions")
      return handleContributionsApi(request, env);
    return env.ASSETS.fetch(request);
  }
};
