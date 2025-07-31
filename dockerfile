FROM node:20
WORKDIR /app

# 소스 복사 및 의존성 설치
COPY . .
RUN npm install

# 개발 서버 실행
EXPOSE 3000
CMD ["npm", "run", "dev"]