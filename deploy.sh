#!/bin/bash

# Get the commit message from the command line argument, or use a default
COMMIT_MESSAGE=${1:-"update deployment"}

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment process...${NC}"

# 1. Clean up v0.ts if it exists
if [ -f "src/lib/v0.ts" ]; then
    echo -e "${GREEN}🧹 Removing v0.ts...${NC}"
    rm src/lib/v0.ts
fi

# 2. Clean up duplicate Supabase client if it exists
if [ -f "src/lib/supabase.ts" ]; then
    echo -e "${GREEN}🧹 Removing duplicate Supabase client...${NC}"
    rm src/lib/supabase.ts
fi

# 3. Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install

# 4. Type check
echo -e "${GREEN}✅ Running type check...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ Type check failed. Please fix the errors and try again.${NC}"
    exit 1
fi

# 5. Git operations
echo -e "${GREEN}📝 Committing changes...${NC}"
git checkout main
git pull origin main
git add .
git commit -m "$COMMIT_MESSAGE"
git push origin main

# 6. Deploy to Vercel
echo -e "${GREEN}🚀 Deploying to Vercel...${NC}"
vercel --prod

echo -e "${GREEN}✨ Deployment complete!${NC}" 