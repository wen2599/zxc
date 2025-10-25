export async function onRequestPost({ request }) {
    try {
        const { url } = await request.json();

        if (!url) {
            return new Response(JSON.stringify({ error: 'URL is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const response = await fetch(url);
        const headers = {};
        response.headers.forEach((value, name) => {
            headers[name] = value;
        });

        const body = await response.text();
        
        const data = {
            status: response.status,
            statusText: response.statusText,
            headers: headers,
            body: body.substring(0, 2000), // 截断body以避免过大的响应
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