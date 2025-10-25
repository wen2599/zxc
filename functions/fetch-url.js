export async function onRequestPost({ request }) {
    try {
        const { url } = await request.json();

        if (!url) {
            return new Response(JSON.stringify({ error: 'URL is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const urlObject = new URL(url);
        const hostname = urlObject.hostname;

        // --- DNS-over-HTTPS Query ---
        const dnsQueryUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
        let dnsInfo = {};
        try {
            const dnsResponse = await fetch(dnsQueryUrl, { headers: { 'accept': 'application/dns-json' } });
            if (dnsResponse.ok) {
                const dnsData = await dnsResponse.json();
                dnsInfo = {
                    hostname: hostname,
                    answers: dnsData.Answer ? dnsData.Answer.map(rec => `${rec.name} -> ${rec.data} (TTL: ${rec.TTL})`) : ['No A records found.'],
                    type: 'A'
                };
            } else {
                dnsInfo = { error: `DNS query failed with status: ${dnsResponse.status}` };
            }
        } catch (e) {
            dnsInfo = { error: `DNS query exception: ${e.message}` };
        }

        // --- Main Fetch ---
        const response = await fetch(url, { redirect: 'follow' });
        const headers = {};
        response.headers.forEach((value, name) => {
            headers[name] = value;
        });

        const body = await response.text();
        
        // --- Assemble All Data ---
        const data = {
            requestDetails: {
                initialUrl: url,
                finalUrl: response.url,
                redirected: response.redirected,
                colo: request.cf.colo, // Cloudflare datacenter location
            },
            dnsInfo: dnsInfo,
            response: {
                status: response.status,
                statusText: response.statusText,
                headers: headers,
                body: body.substring(0, 2000), // Truncate body to avoid oversized responses
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