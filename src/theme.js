import { Platform } from "react-native";

export const FONT_MONO = Platform.select({ ios: "Courier", default: "monospace" });
export const FONT_SERIF = Platform.select({ ios: "Georgia", default: "serif" });

export const COLORS = {
  bg: "#FFF8E7",
  bgCard: "#FFFFFF",
  coral: "#FF6B6B",
  teal: "#4ECDC4",
  yellow: "#FFE66D",
  purple: "#A78BFA",
  pink: "#FF8FC8",
  blue: "#60A5FA",
  textDark: "#2D1B69",
  textMuted: "#8B7DAA",
  border: "#E8DFF5",
  overlay: "rgba(45,27,105,0.75)",
  white: "#FFFFFF",
  danger: "#FF4444",
};

export const SIZES = {
  touchMin: 48,
  textLabel: 16,
  textBody: 14,
  textSmall: 12,
  textTitle: 32,
  textSubtitle: 18,
  radius: 16,
  radiusSmall: 10,
};

export const IS_WEB = Platform.OS === "web";
