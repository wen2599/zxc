document.getElementById('url-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const url = document.getElementById('url-input').value;
    const loading = document.getElementById('loading');
    const resultsContainer = document.getElementById('results-container');
    const resultsDiv = document.getElementById('results');

    loading.style.display = 'block';
    resultsContainer.style.display = 'none';

    try {
        // 注意：现在我们调用的是位于 /fetch-url 的Cloudflare Function
        const response = await fetch('/fetch-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '请求失败');
        }

        resultsDiv.textContent = JSON.stringify(data, null, 2);

    } catch (error) {
        resultsDiv.textContent = `获取信息时发生错误: ${error.message}`;
    } finally {
        loading.style.display = 'none';
        resultsContainer.style.display = 'block';
    }
});
