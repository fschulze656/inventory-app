##Buil Frontend
FROM node:18-alpine3.15 as frontend
WORKDIR /work
COPY inventoryapp/package.json .
COPY inventoryapp/package-lock.json .
RUN npm i
COPY inventoryapp .
RUN mkdir backend
COPY backend/urls.js backend
ENV BUILD_OUTPUT="./dist"
RUN NODE_ENV="production" npm run production
RUN ls -lah dist


FROM node:20-slim as final
ENV PORT=80
ENV NODE_ENV='production'
WORKDIR /app
COPY backend/package.json .
COPY backend/package-lock.json .
COPY backend .
RUN npm i
COPY --from=frontend /work/dist ./build/

CMD ["node", "app.js"]
