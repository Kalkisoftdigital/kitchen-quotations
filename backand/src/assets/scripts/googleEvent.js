const CLIENT_ID = '524296796885-8ra19ns2ou7fgp3c5jk43e0ce7o6pp6o.apps.googleusercontent.com';

const API_KEY = 'AIzaSyCh2jrLQ1qJ4Zk-wBfHsKE04xjPfOMh82c';

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

let tokenClient;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC]
  });
  gapiInited = true;
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '' // defined later
  });
  gisInited = true;
}

function createGoogleEvent(eventDetails, callback) {
  console.log('------it works-------');
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    await scheduleEvent(eventDetails, callback);
  };

  // Check if the client is initialized before accessing getToken()
  if (gapiInited && gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else if (gapiInited) {
    tokenClient.requestAccessToken({ prompt: '' });
  } else {
    // Wait for the client to initialize before requesting the token
    setTimeout(() => {
      createGoogleEvent(eventDetails, callback);
    }, 500);
  }
}


function scheduleEvent(eventDetails, callback) {
  const event = {
    summary: eventDetails.summary, // Use summary from eventDetails
    location: eventDetails.location, // Use location from eventDetails
    description: eventDetails.description, // Use description from eventDetails
    start: {
      dateTime: eventDetails.startTime,
      timeZone: 'America/Los_Angeles'
    },
    end: {
      dateTime: eventDetails.endTime,
      timeZone: 'America/Los_Angeles'
    },
    recurrence: ['RRULE:FREQ=DAILY;COUNT=2'],
    attendees: [{ email: eventDetails.email }], //email from form
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 }
      ]
    }
  };

  const request = gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: event
  });

  request.execute(function (event) {
    console.info('Event created: ' + event.htmlLink);
    // Call the callback function provided
    if (callback) {
      callback();
    }
  });
}

