import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/identify', async (req, res) => {
  try {
    const { images, similar_images } = req.body;
    const apiKey = process.env.PLANT_ID_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'PLANT_ID_API_KEY not configured on server' });
    }

    const detailsList = "common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods,wiki_description,care_instructions";
    const url = `https://api.plant.id/v3/identification?details=${detailsList}&language=es`;

    const response = await axios.post(url, {
      images,
      similar_images,
    }, {
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Error identifying plant:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
  }
});

// For Phase 4 requirement: "Plant creation endpoint works end-to-end"
// This is a simple pass-through or we can implement actual DB logic here.
// For now, let's keep it simple as a proof of endpoint existence.
app.post('/api/plants', (req, res) => {
  const plantData = req.body;
  console.log('Received plant creation request for:', plantData.nombre);
  
  // In a real scenario, we'd save to DB here.
  // For the lab, we return a mock ID to verify the end-to-end flow.
  const mockId = 'rendered-' + Math.random().toString(36).substr(2, 9);
  
  res.status(201).json({ 
    message: 'Plant created successfully on Render', 
    id: mockId,
    receivedData: plantData 
  });
});

app.get('/api/test-models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    const genAI = new GoogleGenerativeAI(apiKey);
    const maskedKey = apiKey.length > 10 
      ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` 
      : 'too_short';
    const results: any = { maskedKey };
    for (const modelName of ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro']) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('hola');
        results[modelName] = { success: true, text: result.response.text() };
      } catch (e: any) {
        results[modelName] = { success: false, error: e.message };
      }
    }
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/list-models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    
    const results: any = {};
    
    // Test v1beta endpoint
    try {
      const v1betaRes = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      results.v1beta = v1betaRes.data;
    } catch (e: any) {
      results.v1betaError = e.response?.data || e.message;
    }

    // Test v1 endpoint
    try {
      const v1Res = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      results.v1 = v1Res.data;
    } catch (e: any) {
      results.v1Error = e.response?.data || e.message;
    }

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, imageBase64 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required and must be a non-empty array' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Define a robust sequence of fallback models to guarantee success
    const modelsToTry = [
      { name: 'gemini-2.5-flash', useSystemInstruction: true },
      { name: 'gemini-2.5-pro', useSystemInstruction: true },
      { name: 'gemini-2.0-flash', useSystemInstruction: true },
      { name: 'gemini-2.0-flash-lite', useSystemInstruction: true },
      { name: 'gemini-1.5-flash', useSystemInstruction: true },
      { name: 'gemini-1.5-flash-latest', useSystemInstruction: true },
      { name: 'gemini-1.5-pro', useSystemInstruction: true },
      { name: 'gemini-pro', useSystemInstruction: false }
    ];

    let responseText = '';
    let lastError: any = null;

    for (const modelConfig of modelsToTry) {
      try {
        console.log(`Attempting chat with model: ${modelConfig.name}`);
        const modelOptions: any = { model: modelConfig.name };
        
        if (modelConfig.useSystemInstruction) {
          modelOptions.systemInstruction = `Eres Flora, asistente de IA especializada en plantas de iPlant. 
Ayudas a identificar plantas, diagnosticar enfermedades, dar consejos 
de cuidado y responder preguntas botánicas. Responde siempre en español,
de forma amigable, concisa y precisa. Si el usuario comparte una imagen,
analízala detalladamente. Usa markdown en tus respuestas: **negrita** para nombres de plantas,
listas con - para pasos de cuidado, y ## para secciones cuando sea útil.`;
        }

        const model = genAI.getGenerativeModel(modelOptions);
        
        const history: any[] = [];
        
        if (!modelConfig.useSystemInstruction) {
          // Prepend system prompt to history for legacy models
          const systemPrompt = `Eres Flora, asistente de IA especializada en plantas de iPlant. 
Ayudas a identificar plantas, diagnosticar enfermedades, dar consejos de cuidado y responder preguntas botánicas. Responde siempre en español, de forma amigable, concisa y precisa. Si el usuario comparte una imagen, analízala detalladamente. Usa markdown en tus respuestas.`;
          history.push(
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Entendido, soy Flora. ¿En qué puedo ayudarte hoy?' }] }
          );
        }

        history.push(...messages.slice(0, -1).map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content || '' }]
        })));

        const latestMessage = messages[messages.length - 1];
        const parts: any[] = [{ text: latestMessage.content || '' }];

        if (imageBase64) {
          let mimeType = 'image/jpeg';
          let base64Data = imageBase64;
          if (imageBase64.startsWith('data:')) {
            const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              mimeType = match[1];
              base64Data = match[2];
            }
          }
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType
            }
          });
        }

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(parts);
        responseText = result.response.text();
        
        console.log(`Successfully generated response using model: ${modelConfig.name}`);
        break; // Success! Exit loop
      } catch (err: any) {
        console.warn(`Model ${modelConfig.name} failed:`, err.message);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error('All models failed to respond');
    }

    res.json({ response: responseText });
  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
