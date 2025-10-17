const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

const manifest = {
  id: "org.archive.movies",
  version: "1.0.0",
  name: "Archive.org Movies",
  description: "Public domain movies from Archive.org",
  types: ["movie"],
  catalogs: [
    {
      type: "movie",
      id: "archiveorg",
      name: "Archive.org",
      extra: [{ name: "search", isRequired: false }]
    }
  ],
  resources: ["catalog", "stream"]
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(({ type, id, extra }) => {
  if (type !== "movie" || id !== "archiveorg") return;

  const query = extra?.search || "classic";
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}+mediatype:movies&output=json`;

  return fetch(url)
    .then(res => res.json())
    .then(data => ({
      metas: data.response.docs.map(doc => ({
        id: doc.identifier,
        name: doc.title,
        type: "movie",
        poster: `https://archive.org/services/img/${doc.identifier}`
      }))
    }));
});

builder.defineStreamHandler(({ id }) => {
  return Promise.resolve({
    streams: [
      {
        title: "Archive.org Stream",
        url: `https://archive.org/download/${id}/${id}.mp4`
      }
    ]
  });
});

module.exports = builder.getInterface();
