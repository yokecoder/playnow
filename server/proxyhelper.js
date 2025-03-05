const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { SocksProxyAgent } = require("socks-proxy-agent");
// Load proxies.json file
const proxies = JSON.parse(
    fs.readFileSync(path.join(__dirname, "proxies.json"), "utf-8")
);

// Function to get a random proxy agent

// Function to get a random working HTTPS proxy
const randomProxyAgent = () => {
    try {
        // Filter only SOCKS5 proxies
        const socks5Proxies = proxies.filter(
            proxy => proxy.protocol === "socks5"
        );

        if (!socks5Proxies.length) {
            throw new Error("No SOCKS5 proxies available");
        }

        const randomProxy =
            socks5Proxies[Math.floor(Math.random() * socks5Proxies.length)];
        return new SocksProxyAgent(randomProxy.proxy);
    } catch (error) {
        console.error("Proxy failed: Trying another...");
        return null; // Ensure function always returns something
    }
};
module.exports = { randomProxyAgent };
