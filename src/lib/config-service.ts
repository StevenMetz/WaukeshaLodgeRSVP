import db from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { RSVPConfig, rsvpConfig as defaultConfig } from "../config/rsvp-config";

const CONFIG_DOC_ID = "rsvp_form";

/**
 * Fetches the RSVP configuration from Firestore.
 * If mapping doesn't exist, it seeds the DB with the default config.
 */
export async function fetchRsvpConfig(): Promise<RSVPConfig> {
  try {
    const docRef = doc(db, "config", CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as RSVPConfig;
    } else {
      // Document doesn't exist, seed it with default static config
      await setDoc(docRef, defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.error("Error fetching RSVP config:", error);
    // Return default config as fallback if Firestore fails (e.g., permissions or offline)
    return defaultConfig;
  }
}

/**
 * Saves the RSVP configuration to Firestore.
 */
export async function saveRsvpConfig(config: RSVPConfig): Promise<void> {
  const docRef = doc(db, "config", CONFIG_DOC_ID);
  await setDoc(docRef, config);
}
