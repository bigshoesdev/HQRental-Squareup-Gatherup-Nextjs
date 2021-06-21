export const API_TOKEN = process.env.API_TOKEN;

export const HQ_RENTAL_LOCATION_1_ID = 1; // Lemon Road
export const HQ_RENTAL_LOCATION_2_ID = 2; // Uluniu Avenue

export const GATHERUP_API_KEY = process.env.GATHERUP_API_KEY;

export const GATHERUP_CLIENT_ID = process.env.GATHERUP_CLIENT_ID;

export const GATHERUP_TOKEN = process.env.GATHERUP_TOKEN;

export const GATHERUP_LOCAION_1_ID = 1555; // Hawaiian Style Rentals & Sales on Lemon Road
export const GATHERUP_LOCAION_2_ID = 1555; // Hawaiian Style Rentals on Uluniu Avenue

export const HQ_RENTAL_GATHERUP_LOCATION_MAP = {
  [HQ_RENTAL_LOCATION_1_ID]: GATHERUP_LOCAION_1_ID,
  [HQ_RENTAL_LOCATION_2_ID]: GATHERUP_LOCAION_2_ID,
};

export const SQUAREUP_ACCESS_TOKEN_SANDBOX =
  "EAAAENMStHonhfCDpljH6S7xDt5MJ54Ds0e09YWYX6LhlLh0JzIEcq0T2ZqjjdPA";

export const SQUAREUP_ACCESS_TOKEN_PRODUCTION =
  process.env.SQUAREUP_ACCESS_TOKEN_PRODUCTION;

export const SQUAREUP_LOCAION_1_ID = ""; // Lemon Road
export const SQUAREUP_LOCAION_2_ID = ""; // Uluniu

export const HQ_RENTAL_SQUAREUP_LOCATION_MAP = {
  [HQ_RENTAL_LOCATION_1_ID]: SQUAREUP_LOCAION_1_ID,
  [HQ_RENTAL_LOCATION_2_ID]: SQUAREUP_LOCAION_2_ID,
};

export const MONGODB_URL = process.env.MONGODB_URL;

export const JWT_SECRET = "amazing script";

export const TOKEN_EXPIRE_IN = "24h";

export const RETRY_TIMEOUT_MIN = 60 * 4;

export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;

export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
