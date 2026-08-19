import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export type User = { id: string; name: string; email: string };
export type Account = { _id: string; name: string; type: string; balance: number; currency?: string };
export type Category = { _id: string; name: string; icon?: string; color?: string; isDefault?: boolean };
export type Transaction = {
  _id: string;
  type: "expense" | "income" | "transfer";
  amount: number;
  note?: string;
  date: string;
  accountId: Account;
  categoryId?: Category;
  transferAccountId?: string;
};

const tokenKey = "trackit-token";
const userKey = "trackit-user";

async function readStorage(key: string) {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function writeStorage(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeStorage(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getToken() {
  return readStorage(tokenKey);
}

export async function getStoredUser() {
  const value = await readStorage(userKey);
  return value ? (JSON.parse(value) as User) : null;
}

export async function signIn(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/mobile/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Unable to sign in");
  await writeStorage(tokenKey, data.token);
  await writeStorage(userKey, JSON.stringify(data.user));
  return data.user as User;
}

export async function signOut() {
  await removeStorage(tokenKey);
  await removeStorage(userKey);
}

export async function api<T>(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Something went wrong");
  return data as T;
}
