const APPLICATIONS_KEY = "wwy-member-applications";
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

function getApplicationsStore(env) {
  return env.WWY_APPLICATIONS;
}

async function readUsers(env) {
  const store = getApplicationsStore(env);
  if (!store) {
    throw new Error("Missing WWY_APPLICATIONS KV binding");
  }

  const rawUsers = await store.get(APPLICATIONS_KEY);
  if (!rawUsers) return [];

  try {
    const parsed = JSON.parse(rawUsers);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

async function writeUsers(env, users) {
  const store = getApplicationsStore(env);
  if (!store) {
    throw new Error("Missing WWY_APPLICATIONS KV binding");
  }

  await store.put(APPLICATIONS_KEY, JSON.stringify(users));
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanEmail(value) {
  return cleanText(value).toLowerCase();
}

function sanitizeUser(input, fallbackStatus = "pending") {
  const source = input && typeof input === "object" ? input : {};
  const status = ALLOWED_STATUSES.has(source.status) ? source.status : fallbackStatus;

  return {
    id: cleanText(source.id) || `user-${Date.now()}`,
    role: "member",
    status,
    name: cleanText(source.name),
    email: cleanEmail(source.email),
    phone: cleanText(source.phone),
    password: String(source.password || ""),
    age: cleanText(source.age),
    location: cleanText(source.location),
    photoName: cleanText(source.photoName),
    photoDataUrl: String(source.photoDataUrl || ""),
    proofName: cleanText(source.proofName),
    points: Number(source.points) || 0,
    createdAt: cleanText(source.createdAt) || new Date().toISOString(),
    reviewedAt: cleanText(source.reviewedAt)
  };
}

function usersMatchByIdentity(firstUser, secondUser) {
  if (firstUser.id && secondUser.id && firstUser.id === secondUser.id) return true;
  if (firstUser.email && secondUser.email && firstUser.email === secondUser.email) return true;
  return Boolean(firstUser.phone && secondUser.phone && firstUser.phone === secondUser.phone);
}

export function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet({ env }) {
  try {
    const users = await readUsers(env);
    return json({ users });
  } catch (error) {
    return json({ error: "Application sync is not configured yet." }, 503);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const incomingUser = sanitizeUser(body.user, "pending");
    incomingUser.status = "pending";

    if (!incomingUser.email && !incomingUser.phone) {
      return json({ error: "Email or phone number is required." }, 400);
    }

    const users = await readUsers(env);
    const existingIndex = users.findIndex((user) => usersMatchByIdentity(user, incomingUser));

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...incomingUser, status: users[existingIndex].status || "pending" };
      await writeUsers(env, users);
      return json({ user: users[existingIndex] });
    }

    users.push(incomingUser);
    await writeUsers(env, users);
    return json({ user: incomingUser }, 201);
  } catch (error) {
    return json({ error: "Application could not be saved." }, 500);
  }
}

export async function onRequestPatch({ request, env }) {
  try {
    const body = await request.json();
    const id = cleanText(body.id);
    const status = cleanText(body.status);

    if (!id || !ALLOWED_STATUSES.has(status)) {
      return json({ error: "A valid application id and status are required." }, 400);
    }

    const users = await readUsers(env);
    const user = users.find((item) => item.id === id);

    if (!user) {
      return json({ error: "Application was not found." }, 404);
    }

    user.status = status;
    user.reviewedAt = new Date().toISOString();

    await writeUsers(env, users);
    return json({ user });
  } catch (error) {
    return json({ error: "Application could not be updated." }, 500);
  }
}
