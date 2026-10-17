require('dotenv').config();

const fetch = require('node-fetch').default;

const ROUTER_IP = '10.0.0.1';
const MY_PASSWORD = process.env.ROUTER_PASSWORD;

(async() => {

// Step 1 - Login
const loginResponse = await fetch(`http://${ROUTER_IP}/check.jst`, {
  method: 'POST',
  redirect: 'manual',
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': `http://${ROUTER_IP}`,
    'Referer': `http://${ROUTER_IP}/`,
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  },
  body: `username=admin&password=${MY_PASSWORD}&locale=false`,
});

if (loginResponse.status !== 302) {
  throw new Error(`Login failed, expected 302 got ${loginResponse.status}`);
}

const [, DUKSID] = loginResponse.headers.get('set-cookie').match(/DUKSID=(jst_[A-Za-z0-9]+)/);
console.log('DUKSID:', DUKSID);

// Step 2 - GET at_a_glance.jst to receive csrfp_token (first time it's issued)
const aagResponse = await fetch(`http://${ROUTER_IP}/at_a_glance.jst`, {
  method: 'GET',
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Referer': `http://${ROUTER_IP}/`,
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Cookie': `DUKSID=${DUKSID}`,
  },
});

const setCookies = aagResponse.headers.raw()['set-cookie'];
const [, CSRF] = setCookies.find(c => c.includes('csrfp_token')).match(/csrfp_token=([^;]+)/);
console.log('CSRF:', CSRF);

// Step 3 - Enable UPnP
const uPnPResponse = await fetch(`http://${ROUTER_IP}/actionHandler/ajaxSet_UPnP_configuration.jst`, {
  method: 'POST',
  headers: {
    'Accept': '*/*',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': `http://${ROUTER_IP}`,
    'Referer': `http://${ROUTER_IP}/device_discovery.jst`,
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Cookie': `DUKSID=${DUKSID}; csrfp_token=${CSRF}`,
  },
  body: new URLSearchParams({
    upnpInfo: JSON.stringify({
      IsEnabledUPnP: 'true',
      Period: '1800',
      Live: '5',
      IsEnabledZero: 'false',
    }),
    csrfp_token: CSRF,
  }),
});

if (uPnPResponse.ok) {
  console.log("UPnP Enabled");
} else {
  console.log("Failed to enable UPnP");
}

// BONUS NOT USED BUT FOR POSTERITY: SEND PORT FORWARD
if (false) {
  const PORT = "9700";
  const IP = "10.0.0.167";

  const portForwardResponse = await fetch(`http://${ROUTER_IP}/actionHandler/ajax_port_forwarding.jst`, {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': `http://${ROUTER_IP}`,
      'Referer': `http://${ROUTER_IP}/device_discovery.jst`,
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
      'Cookie': `DUKSID=${DUKSID}; csrfp_token=${CSRF}`,
    },
    body: new URLSearchParams({
      add: "true",
      name: `MyForward${PORT}`,
      type: "TCP%2FUDP",
      ip: IP,
      ipv6addr: "x",
      startport: PORT,
      endport: PORT,
      csrfp_token: CSRF,
    }),
  });

  if (portForwardResponse.ok) {
    console.log("Port Forwarded");
  } else {
    console.log("Failed to forward port");
  }
}

})();
