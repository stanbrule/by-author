# by-author

Add movies to Radarr, by author

## How to use

1. Create a config.json file in the same directory as index.js

```json
{
  "radarr_url": "<radarr url>/api/",
  "radarr_api_key": "<key>",
  "tmdb_api_key": "<key>",
  "radarr_path": "/path/to/movies",
  "search_on_add": true,
  "monitored": true,
  "profile": "6"
}
```

2. Install dependencies 

`npm i`

3. Run the application

`node index.js <actor name>`
