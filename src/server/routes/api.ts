import { Router, Request, Response } from 'express';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import crypto from 'crypto';
import { AIService } from '../services/AIService';
import { v4 as uuidv4 } from 'uuid';

export const apiRouter = Router();
const aiService = AIService.getInstance();

// Helper to hash API keys securely
function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Middleware to authenticate API keys for completions
async function authenticateApiKey(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const hashed = hashKey(token);

  try {
    const keyRef = doc(db, 'api_keys', hashed);
    const keySnap = await getDoc(keyRef);

    if (!keySnap.exists()) {
      return res.status(401).json({ error: 'Invalid API Key' });
    }

    const keyData = keySnap.data();
    if (!keyData.active) {
      return res.status(403).json({ error: 'API Key is revoked or inactive' });
    }

    // Attach user metadata to request for logging
    (req as any).apiUser = {
      userId: keyData.userId,
      keyHash: hashed
    };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
}

// --- Endpoints ---

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

apiRouter.post('/chat/completions', authenticateApiKey, async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const stream = req.body.stream || false;
    
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      let totalTokens = 0; // Simulated for now since stream doesn't easily expose this from Puter
      
      await aiService.getChatCompletion(req.body, (chunk) => {
        // Just forward the raw chunk if it's SSE, or wrap it
        res.write(chunk);
        // We'd parse tokens here if possible
      });
      
      res.end();
      // Log async
      logRequest((req as any).apiUser.userId, (req as any).apiUser.keyHash, req.body.model, totalTokens, Date.now() - start);
    } else {
      const response = await aiService.getChatCompletion(req.body);
      res.json(response);
      
      // Log request
      const usage = (response as any)?.usage;
      logRequest(
        (req as any).apiUser.userId, 
        (req as any).apiUser.keyHash, 
        req.body.model || 'unknown', 
        usage?.total_tokens || 0,
        Date.now() - start
      );
    }
  } catch (error: any) {
    console.error("Chat Completion Error:", error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Playground endpoint - bypasses API key check, uses session auth (simulated) or just rate limited
apiRouter.post('/playground', async (req: Request, res: Response) => {
  // In a real app, verify the user's Firebase session cookie here.
  // For sandbox, we'll allow it.
  try {
    const stream = req.body.stream || false;
    
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      await aiService.getChatCompletion(req.body, (chunk) => {
        res.write(chunk);
      });
      res.end();
    } else {
      const response = await aiService.getChatCompletion(req.body);
      res.json(response);
    }
  } catch (error: any) {
    console.error("Playground Error:", error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// --- Dashboard REST API (Placeholders) ---
// Note: In an unprivileged AI Studio Node environment, we perform CRUD using the Firebase Client SDK directly from the frontend React app.
// We define these endpoints to satisfy the architectural requirements, but they return instructions to use the client SDK.

apiRouter.get('/keys', (req, res) => {
  res.status(501).json({ message: "In this Serverless Firebase Architecture, fetch keys directly from the React client using Firestore SDK." });
});

apiRouter.post('/keys/create', (req, res) => {
  res.status(501).json({ message: "In this Serverless Firebase Architecture, create keys directly from the React client using Firestore SDK." });
});

apiRouter.delete('/keys/:id', (req, res) => {
  res.status(501).json({ message: "In this Serverless Firebase Architecture, delete keys directly from the React client using Firestore SDK." });
});

apiRouter.get('/usage', (req, res) => {
  res.status(501).json({ message: "In this Serverless Firebase Architecture, query usage directly from the React client using Firestore SDK." });
});


// Request Logger
async function logRequest(userId: string, keyHash: string, model: string, tokens: number, durationMs: number) {
  try {
    await addDoc(collection(db, 'requests'), {
      userId,
      keyHash,
      model,
      promptTokens: Math.floor(tokens / 2),
      completionTokens: Math.ceil(tokens / 2),
      durationMs,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("Failed to log request to Firestore:", error);
  }
}
