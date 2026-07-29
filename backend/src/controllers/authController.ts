import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { clerkClient, getAuth } from "@clerk/express";



/**
 * Retrieves the currently authenticated user's record.
 *
 * Responds with `404` if the user cannot be found and `500` if retrieval fails.
 */
export async function getMe(req:AuthRequest,res:Response,next:NextFunction) {
    
try {
     
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user)

} catch (error) {
    res.status(500).json({message:"internal server eror"})
}

}


/**
 * Synchronizes the authenticated Clerk user with the application database.
 *
 * @param req - The incoming request containing Clerk authentication details
 * @param res - The response used to return the user record
 * @param next - The callback for forwarding processing errors
 */
export async function authCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      // get user info from clerk and save to db
      const clerkUser = await clerkClient.users.getUser(clerkId);

      user = await User.create({
        clerkId,
        name: clerkUser.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
          : clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0],
        email: clerkUser.emailAddresses[0]?.emailAddress,
        avatar: clerkUser.imageUrl,
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500);
    next(error);
  }
}