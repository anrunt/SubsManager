import { redis_client } from '../db/redis';

const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

function generateSecureRandomString(): string {
	const alphabet = "abcdefghijklmnpqrstuvwxyz23456789";

	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	let id = "";
	for (let i = 0; i < bytes.length; i++) {
		id += alphabet[bytes[i] >> 3];
	}
	return id;
}

async function hashSecret(secret: string): Promise<Uint8Array> {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
	return new Uint8Array(secretHashBuffer);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	let c = 0;
	for (let i = 0; i < a.byteLength; i++) {
		c |= a[i] ^ b[i];
	}
	return c === 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRedisSessionResult(data: any): RedisSession {
  try {
    return {
      id: data.id,
      secretHash: Uint8Array.from(
        Buffer.from(data.secretHash, "base64")
      ),
      createdAt: Number(data.createdAt)
    }
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkRedisSessionResult(data: any): data is RedisSession {
  return (
    typeof data?.id === "string" &&
    data?.secretHash instanceof Uint8Array &&
    typeof data?.createdAt === "number"
  )
}

export async function createSession(): Promise<SessionWithToken> {
	const now = new Date();

	const id = generateSecureRandomString();
	const secret = generateSecureRandomString();
	const secretHash = await hashSecret(secret);

	const token = id + "." + secret;

	const session: SessionWithToken = {
		id,
		secretHash,
		createdAt: now,
		token
	};

  const createdAtTimestamp = Math.floor(session.createdAt.getTime() / 1000);

  // Redis saves in base64
  await redis_client.hset(`session:${session.id}`, {
    id: session.id,
    secretHash: Buffer.from(session.secretHash).toString("base64"),
    createdAt: createdAtTimestamp.toString()
  });

	return session;
}

export async function validateSessionToken(token: string): Promise<Session | null> {
	const tokenParts = token.split(".");
	if (tokenParts.length != 2) {
		return null;
	}

	const sessionId = tokenParts[0];
	const sessionSecret = tokenParts[1];

  // Get session from redis
  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

	const tokenSecretHash = await hashSecret(sessionSecret);
	const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
	if (!validSecret) {
		return null;
	}

	return session;
}

async function getSession(sessionId: string): Promise<Session | null> {
	const now = new Date();

  // Get session from redis and check if its not null
  const result:RedisSession = await redis_client.hgetall(`session:${sessionId}`);
  if (!result) {
    return null;
  }

  const redisSession = parseRedisSessionResult(result);

  if (!redisSession || !checkRedisSessionResult(redisSession)) {
    return null;
  }

  const session: Session = {
    id: redisSession.id,
    secretHash: redisSession.secretHash,
    createdAt: new Date(redisSession.createdAt * 1000)
  };

  if (now.getTime() - session.createdAt.getTime() >= sessionExpiresInSeconds * 1000) {
    await deleteSession(sessionId);
    return null;
  }

  return session;
}

async function deleteSession(sessionId: string): Promise<void> {
  await redis_client.del(`session:${sessionId}`);
}

type RedisSession = {
  id: string;
  secretHash: Uint8Array;
  createdAt: number;
} | null;

export interface Session {
  id: string;
  secretHash: Uint8Array;
  createdAt: Date;
}

interface SessionWithToken extends Session {
	token: string;
}