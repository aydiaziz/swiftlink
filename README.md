# SwiftLink

## Environment variables

The application requires an OpenAI API key for the chat functionality.
Set `OPENAI_API_KEY` in your environment before starting the backend:

```bash
export OPENAI_API_KEY=<your-key>
```

If the key is missing the `/api/chat/gpt/` endpoint will return an error.
