# 1단계 : 빌드 스테이지
FROM node:20-alpine AS build
WORKDIR /app

COPY client/package*.json ./
RUN npm install

# 'client' 폴더 안의 소스 파일들을 /app 바로 아래로 복사
COPY client/ ./

# Vite - 도메인 사용
ENV VITE_API_URL=http://parking-backend.local


RUN npm run build

# 2단계 : 실행 스테이지
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Vite는 dist 폴더
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
