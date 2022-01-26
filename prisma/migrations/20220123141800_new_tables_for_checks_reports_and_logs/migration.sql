-- CreateTable
CREATE TABLE "Check" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "path" TEXT,
    "port" INTEGER,
    "webhook" TEXT,
    "timeout" INTEGER DEFAULT 5,
    "interval" INTEGER DEFAULT 10,
    "threshold" INTEGER DEFAULT 1,
    "authentication" TEXT,
    "httpHeaders" TEXT,
    "assert" INTEGER,
    "tags" TEXT,
    "ignoreSSL" BOOLEAN NOT NULL,

    CONSTRAINT "Check_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "availability" INTEGER NOT NULL,
    "outages" INTEGER NOT NULL,
    "downTime" INTEGER NOT NULL,
    "upTime" INTEGER NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logs" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);
