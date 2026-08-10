import { loadFont as loadDisplay } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadBody } from "@remotion/google-fonts/Jost";

export const display = loadDisplay("normal", {
  weights: ["300", "400", "600"],
  subsets: ["latin"],
}).fontFamily;

export const body = loadBody("normal", {
  weights: ["300", "400", "500"],
  subsets: ["latin"],
}).fontFamily;

export const C = {
  deep: "#08202b",
  deeper: "#04141c",
  shell: "#fbf7f1",
  aqua: "#8fe3e8",
  teal: "#1d7f8c",
  ink: "#0d2b33",
  gold: "#e3c07d",
};

export const EASE = [0.22, 0.61, 0.36, 1] as const;
