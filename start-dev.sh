#!/bin/bash
echo "Starting Next.js development server..."
export NO_PROXY=localhost,127.0.0.1
export AUTH_SECRET=ZPw0jm2vdTz5MdJ/BjNYkF2ZY3xhJaZttOL1QyV/bWI=
export NEXTAUTH_URL=http://localhost:3000
export MOCK_DATA_ENABLED=true
export NODE_ENV=development

npx next dev --port 3000