const Airtable = require("airtable");

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });

const base = airtable.base(process.env.AIRTABLE_BASE_ID);

// maps over the records, calling minifyRecord, giving us required data
const getMinifiedRecords = (records) => {
  return records.map((record) => minifyRecord(record));
};

// gets the data we want and puts it into variables
const minifyRecord = (record) => {
  return {
    id: record.id,
    fields: record.fields,
  };
};

async function getTable(table) {
  const records = await base(table).select({}).all();
  const minifiedRecords = await getMinifiedRecords(records);

  return minifiedRecords;
}

async function getAllPosts() {
  const records = await base("Blog")
    .select({
      filterByFormula: `OR({status} = "Published", {status} = "Draft")`,
    })
    .all();

  const minifiedRecords = await getMinifiedRecords(records);

  return minifiedRecords;
}

async function getAllNewsletters() {
  const records = await base("Newsletter")
    .select({
      filterByFormula: `{status} = "Published"`,
    })
    .all();

  const minifiedRecords = await getMinifiedRecords(records);

  return minifiedRecords;
}

async function getAllNewsletterPaths() {
  const newsletter = await getAllNewsletters();

  return newsletter.map((nl) => {
    return {
      params: {
        id: nl.id,
        slug: nl.fields.Slug,
      },
    };
  });
}

async function getAllPostsPaths() {
  const posts = await getAllPosts();

  return posts.map((post) => {
    return {
      params: {
        id: post.id,
        slug: post.fields.slug,
      },
    };
  });
}

async function getNewsletterData(slug) {
  const records = await base("Newsletter")
    .select({
      maxRecords: 1,
      filterByFormula: `{Slug} = "${slug}"`,
    })
    .all();

  const newsletter = await getMinifiedRecords(records);

  return {
    newsletter,
  };
}

async function getPostData(slug) {
  const records = await base("Blog")
    .select({
      maxRecords: 1,
      filterByFormula: `{slug} = "${slug}"`,
    })
    .all();

  const post = await getMinifiedRecords(records);

  return {
    post,
  };
}

export {
  getTable,
  getAllPosts,
  getPostData,
  getAllPostsPaths,
  getNewsletterData,
  getAllNewsletterPaths,
  getAllNewsletters,
};
