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

// --- Models List ---
const AVAILABLE_MODELS = [
  // Current models
  { id: 'gpt-3.5-turbo',        object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'gpt-4',                object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'qwen-max',             object: 'model', created: 1677610602, owned_by: 'ngai' },
  // Free & Open-Weights Models
  { id: 'deepseek-v4-flash',         object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'deepseek-v3.2',             object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'deepseek-r1-0528',          object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'qwen-2.5-7b-instruct',      object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'qwen-2.5-14b-instruct',     object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'qwen-2.5-coder-7b',         object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'llama-3.1-8b-instruct',     object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'gemma-2-9b-it',             object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'mistral-7b-instruct',       object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'phi-3-medium-instruct',     object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'gemini-3.5-flash',          object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'gemini-3.1-flash-lite',     object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'qwen/qwen3.6-flash',        object: 'model', created: 1677610602, owned_by: 'ngai' },
  { id: 'gemma-4-light',             object: 'model', created: 1677610602, owned_by: 'ngai' },
];

// --- Endpoints ---

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// OpenAI-compatible models list
apiRouter.get('/models', (req, res) => {
  res.json({
    object: 'list',
    data: AVAILABLE_MODELS
  });
});

apiRouter.post('/chat/completions', authenticateApiKey, async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const stream = req.body.stream || false;
    
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      let totalTokens = 0;
      
      await aiService.getChatCompletion(req.body, (chunk) => {
        res.write(chunk);
      });
      
      res.end();
      logRequest((req as any).apiUser.userId, (req as any).apiUser.keyHash, req.body.model, totalTokens, Date.now() - start);
    } else {
      const response = await aiService.getChatCompletion(req.body);
      res.json(response);
      
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

// Playground endpoint - bypasses API key check
apiRouter.post('/playground', async (req: Request, res: Response) => {
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

// --- Dashboard REST API ---
apiRouter.get('/keys', (req, res) => {
  res.status(501).json({ message: "Fetch keys directly from the React client using Firestore SDK." });
});

apiRouter.post('/keys/create', (req, res) => {
  res.status(501).json({ message: "Create keys directly from the React client using Firestore SDK." });
});

apiRouter.delete('/keys/:id', (req, res) => {
  res.status(501).json({ message: "Delete keys directly from the React client using Firestore SDK." });
});

apiRouter.get('/usage', (req, res) => {
  res.status(501).json({ message: "Query usage directly from the React client using Firestore SDK." });
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
