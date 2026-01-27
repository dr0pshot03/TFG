import { clerkClient } from "@clerk/express";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

// Extend the Request interface to include the 'auth' property
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId?: string;
      };

      // Add 'user' and 'clerkUser' properties to the Request interface
      user?: {
        id: string;
        email: string;
        clerkId: string;
        lastLoginAt: Date;
        [key: string]: any;
      };
      clerkUser?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

const prisma = new PrismaClient();

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // For testing environment
    if (req.hostname === "localhost") {
      const user = await prisma.user.findUnique({
        where: { email: "amithc@baliza.io" },
      });

      if (!user) {
        return res.status(404).json({ message: "Create Dummy testing user " });
      }

      req.user = {
        ...user,
        clerkId: user.clerkId ?? "",
        lastLoginAt: new Date(),
      };

      next();
      return;
    }

    const { userId } = req.auth || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth?.userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date(),
      },
    });

    req.user = {
      ...user,
      clerkId: userId,
      lastLoginAt: new Date(),
    };
    next();
  } catch (error) {
    console.error("Error in requireAuth middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};