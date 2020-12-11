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

## Notes About Usage

- The script will take the first results from TMDB, it might work to use the Person's ID, but I haven't tested that.

- Multiple actors can be searched for at once, just specify more than one, e.g. `node index.js "Jack Nicholson" "Tom Cruise"`

- The actor's name must be quoted, else the script will execute a search for each term.
