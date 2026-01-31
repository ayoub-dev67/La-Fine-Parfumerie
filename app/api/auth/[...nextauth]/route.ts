/**
 * API Route NextAuth.js
 * Gère toutes les routes /api/auth/*
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
