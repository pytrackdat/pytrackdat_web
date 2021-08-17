// Use || rather than ?? to make both undefined and "" false-y
// GLOBAL_PTD_CONFIG will be set by /config/config.js via a volume in the container for
// production deployments; the .env file is used for development purposes.
export const BASE_URL = GLOBAL_PTD_CONFIG?.BASE_URL || process.env.PTD_BASE_URL;
export const MAPBOX_TOKEN = GLOBAL_PTD_CONFIG?.MAPBOX_TOKEN || process.env.PTD_MAPBOX_TOKEN;
