import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";

// Collection name mappings
const COLLECTIONS = {
  "hero-slides": "hero_slides",
  "showcase": "showcase_items",
  "testimonials": "testimonials",
  "stats": "stats"
};

/**
 * Fetch content from Firestore by collection kind
 * @param {string} kind - Collection type (hero-slides, showcase, testimonials, stats)
 * @returns {Promise<Array>} Array of documents
 */
export const fetchContent = async (kind) => {
  try {
    const collName = COLLECTIONS[kind];
    if (!collName) throw new Error(`Unknown collection: ${kind}`);
    
    const q = query(collection(db, collName), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching ${kind}:`, error);
    return [];
  }
};

/**
 * Create or update a document in Firestore
 * @param {string} kind - Collection type
 * @param {Object} data - Document data (must include 'id' field)
 * @returns {Promise<Object>} The saved document
 */
export const saveContent = async (kind, data) => {
  try {
    const collName = COLLECTIONS[kind];
    if (!collName) throw new Error(`Unknown collection: ${kind}`);
    
    const docId = data.id;
    if (!docId) throw new Error("Document must have an 'id' field");
    
    await setDoc(doc(db, collName, docId), data);
    console.log(`Document ${docId} saved to ${collName}`);
    return data;
  } catch (error) {
    console.error(`Error saving to ${kind}:`, error);
    throw error;
  }
};

/**
 * Delete a document from Firestore
 * @param {string} kind - Collection type
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteContent = async (kind, docId) => {
  try {
    const collName = COLLECTIONS[kind];
    if (!collName) throw new Error(`Unknown collection: ${kind}`);
    
    await deleteDoc(doc(db, collName, docId));
    console.log(`Document ${docId} deleted from ${collName}`);
  } catch (error) {
    console.error(`Error deleting from ${kind}:`, error);
    throw error;
  }
};
