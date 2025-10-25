async function queryDns(hostname, type) {
    const start = Date.now();
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`;
    try {
        const response = await fetch(url, { headers: { 'accept': 'application/dns-json' } });
        const duration = Date.now() - start;
        if (!response.ok) return { type, duration, error: `DNS query failed with status ${response.status}` };
        
        const data = await response.json();
        const answers = data.Answer ? data.Answer.map(rec => `${rec.data} (TTL: ${rec.TTL})`) : ['No records found.'];
        return { type, duration, answers };
    } catch (e) {
        const duration = Date.now() - start;
        return { type, duration, error: e.message };
    }
}

export async function onRequestPost({ request }) {
    try {
        const { url } = await request.json();
        if (!url) {
            return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400 });
        }

        const urlObject = new URL(url);
        const hostname = urlObject.hostname;

        // --- Perform all DNS queries in parallel ---
        const dnsPromises = ['A', 'AAAA', 'CNAME', 'MX', 'TXT'].map(type => queryDns(hostname, type));
        const dnsResults = await Promise.all(dnsPromises);

        // --- Main Fetch with timing ---
        const fetchStart = Date.now();
        const response = await fetch(url, { redirect: 'follow' });
        const fetchDuration = Date.now() - fetchStart;

        const headers = {};
        response.headers.forEach((value, name) => { headers[name] = value; });

        const body = await response.text();
        
        // --- Assemble All Data ---
        const data = {
            summary: {
                initialUrl: url,
                finalUrl: response.url,
                redirected: response.redirected,
                colo: request.cf.colo, // Cloudflare datacenter
                status: response.status,
                statusText: response.statusText,
                fetchDuration: `${fetchDuration} ms`
            },
            dns: dnsResults,
            headers: headers,
            body: body.substring(0, 5000), // Increased body limit
            tls: {
                version: request.cf.tlsVersion,
                cipher: request.cf.tlsCipher,
                clientAuth: request.cf.tlsClientAuth
            },
            clientInfo: {
                asn: request.cf.asn,
                asOrganization: request.cf.asOrganization,
                country: request.cf.country,
                city: request.cf.city,
                continent: request.cf.continent,
                httpProtocol: request.cf.httpProtocol,
                latitude: request.cf.latitude,
                longitude: request.cf.longitude,
                postalCode: request.cf.postalCode,
                region: request.cf.region,
                regionCode: request.cf.regionCode,
                timezone: request.cf.timezone
            }
        };

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
