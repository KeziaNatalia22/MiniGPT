# Backend Setup

This is the Express + TypeScript backend that acts as a proxy for the Gemini API.

## Environment Variables

Create a `.env` file in this directory with the following variables:

```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_BASE=https://generativelanguage.googleapis.com/v1
PORT=4000
```

To get your Gemini API key:
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an account or sign in
3. Create a new API key
4. Copy the key and add it to your `.env` file

## Running the Backend

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## API Endpoints

- `POST /api/ai` - Send a text prompt to the Gemini API
  - Request body: `{ "text": "your message here" }`
  - Response: `{ "text": "Gemini's response" }`

## Dependencies

- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variable management
- `axios`: HTTP requests

## Troubleshooting

1. If you get `GEMINI_API_KEY is not configured` errors:
   - Make sure you created a `.env` file with your API key
   - Verify that the `.env` file is in the `backend` directory
   - Check that the variable name is exactly `GEMINI_API_KEY`

2. If changes to `.env` are not reflected:
   - Restart the development server after making changes to `.env`