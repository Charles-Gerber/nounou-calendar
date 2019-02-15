const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'

const NB_EVENTS_TO_FETCH = 400

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err)
  // Authorize a client with credentials, then call the Google Calendar API.
  authorize(JSON.parse(content), listEvents)
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback)
    oAuth2Client.setCredentials(JSON.parse(token))
    callback(oAuth2Client)
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', code => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
      callback(oAuth2Client)
    })
  })
}

const KEYS_LOCATION_1 = [`Lebouteux`]
const KEYS_LOCATION_2 = [`Legendre`]
const KEYS_OFF_RECUP = [`Jour de récupération`]
const KEYS_OFF_CONGE_PAYE = [`Congés payés`]

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth })
  calendar.events.list(
    {
      calendarId: '5l8951pg6g060dton2km0kveds@group.calendar.google.com',
      timeMin: `2019-01-01T00:00:00-00:00`,
      timeMax: `2019-12-31T23:59:59-00:00`,
      maxResults: NB_EVENTS_TO_FETCH,
      singleEvents: true,
      orderBy: 'startTime',
    },
    (err, res) => {
      if (err) return console.log('The API returned an error: ' + err)
      const events = res.data.items
      if (events.length) {
        console.log(
          `Nb events fetched : ${events.length} / ${NB_EVENTS_TO_FETCH} (limit)`
        )

        
        events.forEach((event) => {

        })

        const daysOffRecup = events.filter(event =>
          KEYS_OFF_RECUP.includes(event.summary)
        )
        console.log('Jours de récupérations:')
        daysOffRecup.map((event, i) => {
          logEvent(event)
        })

        const daysOffCongesPayes = events.filter(event =>
          KEYS_OFF_CONGE_PAYE.includes(event.summary)
        )
        console.log('Jours Congés payés:')
        daysOffCongesPayes.map((event, i) => {
          logEvent(event)
        })

      } else {
        console.log('No upcoming events found.')
      }
    }
  )

  function logEvent(event) {
    const start = event.start.dateTime || event.start.date
    console.log(`${start} - ${event.summary}`)
  }
}
