FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
COPY dist ./dist
#RUN npm install --legacy-peer-deps
RUN npm install
RUN npm install -g @nestjs/cli
EXPOSE 3000
CMD ["npm", "start"]

# COPY . .
# RUN npm run build

# FROM node:20-alpine as production
# WORKDIR /app
# COPY --from=builder /app/package*.json ./
# RUN npm install --production --legacy-peer-deps
# COPY --from=builder /app/dist ./dist
# EXPOSE 3000
# ENV NODE_ENV=production
# CMD ["node", "src/main.ts"]
