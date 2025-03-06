const ytdl = require("@distube/ytdl-core");

// Paste full cookies from EditThisCookie
const cookies = [
    {
        name: "VISITOR_INFO1_LIVE",
        value: "jvqwDcKwR2Y",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "YSC",
        value: "wtKBO-2MPTk",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "PREF",
        value: "f6=40000000&tz=Asia.Calcutta",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "SAPISID",
        value: "cgYE6Db8lyWdIXkT/Aq95i-XenlfbMVGYi",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "APISID",
        value: "d3cKjZfEDYGJCixX/AQdZ6lilLSPLbHWAJ",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "SSID",
        value: "APeELpgPd2A0tLdUJ",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "HSID",
        value: "A2OjpOunTAGC0Bz4X",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "SID",
        value: "g.a000uQhIujuAisuvZTGF40187HWFDuoTAUMQ7gLrkx8R4hc7d2bvHvQToKOi9f0H1yXqoBWJSwACgYKAfcSARMSFQHGX2Mi0FafHzBuOl1xhANnzMN44xoVAUF8yKo5mp35hb8zL3MyK7ehRB6_0076",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "LOGIN_INFO",
        value: "AFmmF2swRAIgXgzlpiWUXQI5BcYnpK2rp-6dbDzO1TQr1MccQT2FoZcCICwHci1C3W4rzrfHdMYuV8EWYSZ178lj0wEV5C2y2vf2:QUQ3MjNmeTFEME1sTUVvYXNpZjBCOTdEeWlOVk5qdjl6Q21tZFNRalY2SXRweEFJZmFKdGZSSFZhWVRVbko1RERDTnhEX2hfZkdZeGxwWlhnOGdGSnBlWDd3VTNaUTJ3emRGQzFQQ1RpdGk4TG5Ga0ZldHNZSFpOM2otVUtHQ25qcFNMUVExYUFVLUtwQ1lHOWZEcnJtYlRtenQzZGlRNUNB",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "__Secure-3PAPISID",
        value: "cgYE6Db8lyWdIXkT/Aq95i-XenlfbMVGYi",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "__Secure-3PSID",
        value: "g.a000uQhIujuAisuvZTGF40187HWFDuoTAUMQ7gLrkx8R4hc7d2bvFC3K4w1-VVi3LT9i2D9y2AACgYKAQMSARMSFQHGX2MiNWZI1R8XwpQMLKUhdXvnExoVAUF8yKraOjYV65xG7vPrdCxY76kw0076",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "__Secure-3PSIDCC",
        value: "AKEyXzUyryPUiYTO03yg_3yZ0G_H29dv8Gesywt5pAxLGOPJMcsRMvWsmlY1Wu8pp75Uz394",
        domain: ".youtube.com",
        path: "/",
        secure: true
    }
];

// Additional agent options
const agentOptions = {
    pipelining: 5,
    maxRedirections: 0,
    localAddress: "127.0.0.1"
};

// Custom Headers to Mimic a Browser Request
const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.5",
    Referer: "https://www.youtube.com/",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive"
};

// Create Persistent Agent
const YTDL_AGENT = ytdl.createAgent(cookies, agentOptions, headers);

module.exports = YTDL_AGENT;
