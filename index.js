const config = require('./config.json')
const axios = require('axios').default
const aPool = require('tiny-async-pool')

// set up axios
axios.defaults.headers.common = {"Content-Type": "application/json"}

const tmdbConf = {baseURL: 'https://api.themoviedb.org/3/'}
const tmdb = axios.create(tmdbConf)
const tmdb_key = config.tmdb_api_key

const radarrConf = {baseURL: config.radarr_url}
const radarr = axios.create(radarrConf)
const radar_key = config.radarr_api_key

async function addMovie (movie) {
  console.log(`Getting details about \'${movie.title}\' from radarr`)
  const radarrDetails = await viaRadarr(movie)
  console.log(`Adding ${movie.title}...`)
  const radarrResults = await addRadarr(radarrDetails.data)
}

function viaRadarr(movie) {
  console.log()
  return radarr.get('movie/lookup/tmdb', {params: {tmdbId: movie.id,apikey: radar_key}})
}

async function addRadarr(movie) {
  movie.qualityProfileId = parseInt(config.profile),
  movie.path = `${config.radarr_path}/${movie.title.replace(/\//, '-')} (${movie.year})`
  movie.monitored = config.monitored
  movie.addOptions = {"searchForMovie" : config.search_on_add}
  return await radarr.post(`movie?apikey=${radar_key}`, movie)
  .then((res) => {console.log(`Successfully added \'${movie.title}\' to Radarr`)})
  .catch((err) => {
    if (err.response.status === 400) {console.log(`\'${movie.title}\' already exists in Radarr`)} 
    else if (err.response.stats >= 500) {console.log(`Server error while adding \'${movie.title}\'`)}
  })
}

// returns an array of movies. do the filtering here?
async function searchMovies(val) {
  console.log(`finding movies by ${val.name}`)
  return (await tmdb.get('person/'+val.id+'/movie_credits', {params: {api_key: tmdb_key} })).data.cast
}

async function filterMissing (found) {
  // get the movies, extract the tmdbId
  console.log(`removing results already present in radarr...`)
  const existingIds=(await radarr.get('movie',{params: {apikey: radar_key}})).data.map(movie => movie.tmdbId)
  return found.filter(movie => !(existingIds.includes(movie.id)))
}

function searchActors(val) {
  console.log(`searching for actors named ${val}`)
  return tmdb.get('search/person', {params: {query: val,api_key: tmdb_key}})
}

// loop over input!
process.argv.forEach((val, index) => {
  if (index >= 2) {
  // grab top actor by search
  searchActors(val)
    // get all movies by actor
    .then((res) => searchMovies(res.data.results[0]))
    // filter the results to remove entries already in radarr
    .then(res => filterMissing(res))
    // throw the results into an async pool, calling the addMovie function for each
    .then((res) => aPool(1, res, addMovie))
    // incase i made a boneheaded mistake :(
    .catch((err) => console.log(`\nThere was an error processing your request :^( \n\t ${err}\n`))
  }
})
