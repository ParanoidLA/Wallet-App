const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to parse JSON body
router.use(express.json());

/**
 * 1. Automatically create a user record in Prisma after signing up with Clerk.
 * Triggered from React Native after Clerk sign-up/login.
 */
router.post("/users", async (req, res) => {
  const { clerkId, email, username } = req.body; // Use Clerk's id, email, and username
  try {
    let user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          username,
          wallets: {
            create: {
              balance: 0, // Default wallet balance
            },
          },
        },
        include: { wallets: true },
      });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. Fetch user details by Clerk's id, including wallets and transactions.
 */
router.get("/users/:clerkId", async (req, res) => {
  const { clerkId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        wallets: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. Update wallet balance.
 */
router.patch("/wallets/:walletId", async (req, res) => {
  const { walletId } = req.params;
  const { balance } = req.body;

  try {
    const wallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { balance },
    });

    res.status(200).json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. Add a transaction (send/receive).
 */
router.post("/wallets/:walletId/transactions", async (req, res) => {
  const { walletId } = req.params;
  const { type, amount, category } = req.body; // "send" or "receive", amount, and category

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    // Update wallet balance
    const updatedBalance =
      type === "send" ? wallet.balance - amount : wallet.balance + amount;

    if (updatedBalance < 0) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: updatedBalance },
    });

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        walletId,
        type,
        amount,
        category,
      },
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5. Get transaction history for a wallet.
 */
router.get("/wallets/:walletId/transactions", async (req, res) => {
  const { walletId } = req.params;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { walletId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;