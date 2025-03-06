import express from 'express';
import {
  getItems,
  getItemById,
  getCommunities,
  getCollections,
  getCommunityById,
  getItemsByCollection,
  getItemsWithContent,
} from '../controllers/dspaceController.js';

const router = express.Router();

router.get('/items', getItems);
router.get('/items/:id', getItemById);
router.get('/communities', getCommunities);
router.get('/collections', getCollections);
router.get('/communities/:id', getCommunityById); // To get a specific community
router.get('/collections/:collectionId/items', getItemsByCollection); // To get items in a specific collection
router.get('/items/with-content', getItemsWithContent); // To get items that have content

export default router;
