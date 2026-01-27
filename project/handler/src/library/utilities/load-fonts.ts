import { join } from "node:path";
import { logger } from "@riceball/logger";
import { loadFontsFromDirectory } from "canvas-constructor/napi-rs";

const __dirname = import.meta.dirname;
const PATH = join(__dirname, "..", "assets", "fonts");

export const loadCanvasFonts = () => {
	loadFontsFromDirectory(PATH);
	logger.info("Loaded fonts");
};
