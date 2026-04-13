-- GitHub OAuth almacenado en el usuario (login + vincular repo)
ALTER TABLE "User" ADD COLUMN "githubAccessToken" TEXT;
ALTER TABLE "User" ADD COLUMN "githubUsername" TEXT;
