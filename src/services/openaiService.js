import axios from 'axios';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
export const generateTitle = async (noteContent) => {
  if (!noteContent || noteContent.trim().length < 20) {
    return "New Note";
  }

  const prompt = `Generate a concise, 5-word-or-less title for the following note content. Do not include quotes.

  CONTENT: """${noteContent}"""
  
  TITLE:`;

  try {
    const response = await axios.post(
      API_URL,
      {
        "contents": [
          {
            "parts": [
              { "text": prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text.trim().replace(/"/g, '');

  } catch (error) {
    console.error("Error generating title with Gemini:", error.response.data);
    return "AI Error";
  }
};