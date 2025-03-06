import { pool } from '../index.js';
import pkg from 'validator';
const { isUUID } = pkg;

// Get a list of items with basic details
export const getItems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
          i.uuid AS item_uuid,
          mv_title.text_value AS title,
          mv_authors.text_value AS authors,
          mv_uri.text_value AS uri,
          mv_date.text_value AS date,
          mv_abstract.text_value AS abstract
      FROM
          public.item i
      LEFT JOIN
          public.metadatavalue mv_title ON mv_title.dspace_object_id = i.uuid AND mv_title.metadata_field_id = (SELECT metadata_field_id FROM public.metadatafieldregistry WHERE element = 'title' LIMIT 1)
      LEFT JOIN
          public.metadatavalue mv_authors ON mv_authors.dspace_object_id = i.uuid AND mv_authors.metadata_field_id = (SELECT metadata_field_id FROM public.metadatafieldregistry WHERE element = 'contributor' AND qualifier = 'author' LIMIT 1)
      LEFT JOIN
          public.metadatavalue mv_uri ON mv_uri.dspace_object_id = i.uuid AND mv_uri.metadata_field_id = (SELECT metadata_field_id FROM public.metadatafieldregistry WHERE element = 'identifier' AND qualifier = 'uri' LIMIT 1)
      LEFT JOIN
          public.metadatavalue mv_date ON mv_date.dspace_object_id = i.uuid AND mv_date.metadata_field_id = (SELECT metadata_field_id FROM public.metadatafieldregistry WHERE element = 'date' AND qualifier = 'issued' LIMIT 1)
      LEFT JOIN
          public.metadatavalue mv_abstract ON mv_abstract.dspace_object_id = i.uuid AND mv_abstract.metadata_field_id = (SELECT metadata_field_id FROM public.metadatafieldregistry WHERE element = 'description' AND qualifier = 'abstract' LIMIT 1);
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isUUID(id)) {
      return res.status(400).json({ error: 'Invalid UUID format' });
    }

    const result = await pool.query(`
      SELECT 
        item.item_id,
        item.in_archive,
        item.withdrawn,
        item.last_modified,
        item.discoverable,
        item.uuid,
        item.submitter_id,
        item.owning_collection,
        collection.collection_id,
        eperson.eperson_id,
        eperson.email AS submitter_email,
        eperson.netid AS submitter_netid,
        bundle.bundle_id,
        bitstream.uuid AS bitstream_uuid,
        bitstreamformatregistry.mimetype AS bitstream_format
      FROM 
        item
      LEFT JOIN collection ON item.owning_collection = collection.uuid
      LEFT JOIN eperson ON item.submitter_id = eperson.uuid
      LEFT JOIN item2bundle ON item.uuid = item2bundle.item_id
      LEFT JOIN bundle ON item2bundle.bundle_id = bundle.uuid
      LEFT JOIN bundle2bitstream ON bundle.uuid = bundle2bitstream.bundle_id
      LEFT JOIN bitstream ON bundle2bitstream.bitstream_id = bitstream.uuid
      LEFT JOIN bitstreamformatregistry ON bitstream.bitstream_format_id = bitstreamformatregistry.bitstream_format_id
      WHERE item.uuid = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all communities
export const getCommunities = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM community');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get detailed data for collections, joining collection and community information
export const getCollections = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          collection.collection_id,
          collection.uuid AS collection_uuid,  -- Changed from collection.name to collection.uuid
          collection.submitter AS collection_submitter,
          community.community_id AS community_id,
          community.name AS community_name, 
          community.short_description AS community_description
        FROM 
          collection
        LEFT JOIN community ON collection.uuid = community.collection_id
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

// Get detailed information about a specific community
export const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM community WHERE community_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get detailed data for all items in a specific collection
export const getItemsByCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const result = await pool.query(`
      SELECT 
        item.item_id,
        item.title,
        item.description,
        item.last_modified,
        item.uuid,
        collection.collection_id,
        collection.name AS collection_name
      FROM 
        item
      LEFT JOIN collection ON item.owning_collection = collection.uuid
      WHERE collection.uuid = $1
    `, [collectionId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items in collection:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all the items with content (displayable)
export const getItemsWithContent = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          item.item_id,
          item.title,
          item.description,
          item.last_modified,
          content.content_id,
          content.mime_type,
          content.size
        FROM item
        LEFT JOIN content ON item.item_id = content.item_id
        WHERE content.content_id IS NOT NULL
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching items with content:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
