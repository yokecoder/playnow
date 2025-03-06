const ytdl = require("@distube/ytdl-core");

// Paste full cookies from EditThisCookie
const cookies = [
    {
        name: "YSC",
        value: "wtKBO-2MPTk"
    },
    {
        name: "VISITOR_INFO1_LIVE",
        value: "jvqwDcKwR2Y"
    },
    {
        name: "PREF",
        value: "f6=40000000&tz=Asia.Calcutta"
    },
    {
        name: "SAPISID",
        value: "cgYE6Db8lyWdIXkT/Aq95i-XenlfbMVGYi"
    },
    {
        name: "APISID",
        value: "d3cKjZfEDYGJCixX/AQdZ6lilLSPLbHWAJ"
    },
    {
        name: "SSID",
        value: "APeELpgPd2A0tLdUJ"
    },
    {
        name: "HSID",
        value: "A2OjpOunTAGC0Bz4X"
    },
    {
        name: "SID",
        value: "g.a000uQhIujuAisuvZTGF40187HWFDuoTAUMQ7gLrkx8R4hc7d2bvHvQToKOi9f0H1yXqoBWJSwACgYKAfcSARMSFQHGX2Mi0FafHzBuOl1xhANnzMN44xoVAUF8yKo5mp35hb8zL3MyK7ehRB6_0076"
    },
    {
        name: "LOGIN_INFO",
        value: "AFmmF2swRAIgXgzlpiWUXQI5BcYnpK2rp-6dbDzO1TQr1MccQT2FoZcCICwHci1C3W4rzrfHdMYuV8EWYSZ178lj0wEV5C2y2vf2:QUQ3MjNmeTFEME1sTUVvYXNpZjBCOTdEeWlOVk5qdjl6Q21tZFNRalY2SXRweEFJZmFKdGZSSFZhWVRVbko1RERDTnhEX2hfZkdZeGxwWlhnOGdGSnBlWDd3VTNaUTJ3emRGQzFQQ1RpdGk4TG5Ga0ZldHNZSFpOM2otVUtHQ25qcFNMUVExYUFVLUtwQ1lHOWZEcnJtYlRtenQzZGlRNUNB"
    },
    {
        name: "__Secure-3PAPISID",
        value: "cgYE6Db8lyWdIXkT/Aq95i-XenlfbMVGYi"
    },
    {
        name: "__Secure-3PSID",
        value: "g.a000uQhIujuAisuvZTGF40187HWFDuoTAUMQ7gLrkx8R4hc7d2bvFC3K4w1-VVi3LT9i2D9y2AACgYKAQMSARMSFQHGX2MiNWZI1R8XwpQMLKUhdXvnExoVAUF8yKraOjYV65xG7vPrdCxY76kw0076"
    },
    {
        name: "__Secure-3PSIDCC",
        value: "AKEyXzUyryPUiYTO03yg_3yZ0G_H29dv8Gesywt5pAxLGOPJMcsRMvWsmlY1Wu8pp75Uz394"
    },
    { name: "SIDCC", value:"AKEyXzUXePwbLFP7ih6iTfzNfRvBkwEoXVUBvdgooE2MUFXS8tMLx1YlsuvEfhmiXEGBfngf"}
];

// Additional agent options
const agentOptions = {
    pipelining: 0,
    maxRedirections: 5,
    domain: ".youtube.com",
    path: "/",
    secure: true
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
