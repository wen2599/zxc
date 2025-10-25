document.addEventListener('DOMContentLoaded', function() {

    const urlForm = document.getElementById('url-form');
    const urlInput = document.getElementById('url-input');
    const iframe = document.getElementById('content-iframe');
    const debugControls = document.getElementById('debug-controls');
    const showDebugBtn = document.getElementById('show-debug-btn');
    const debugModal = document.getElementById('debug-modal');
    const resultsDiv = document.getElementById('results');
    const closeModalBtn = document.querySelector('.close-btn');
    const copyBtn = document.getElementById('copy-btn');

    let currentUrl = '';

    urlForm.addEventListener('submit', function(event) {
        event.preventDefault();
        let url = urlInput.value.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        currentUrl = url;
        iframe.src = currentUrl;
        debugControls.style.display = 'block';
    });

    showDebugBtn.addEventListener('click', async function() {
        if (!currentUrl) {
            alert('请先加载一个页面。');
            return;
        }

        resultsDiv.textContent = '加载中...';
        copyBtn.textContent = '一键复制';
        debugModal.style.display = 'block';

        try {
            const response = await fetch('/fetch-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: currentUrl })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || '请求失败');

            // Format the output for better readability
            const formattedOutput = 
`=======================================
[+] Request Details
=======================================
Initial URL: ${data.requestDetails.initialUrl}
Final URL:   ${data.requestDetails.finalUrl}
Redirected:  ${data.requestDetails.redirected}
CF-Colo:     ${data.requestDetails.colo}

=======================================
[+] DNS Info (A Records)
=======================================
Hostname: ${data.dnsInfo.hostname}
${data.dnsInfo.answers ? data.dnsInfo.answers.join('\n') : 'N/A'}

=======================================
[+] Response (Status: ${data.response.status} ${data.response.statusText})
=======================================

--- HEADERS ---
${JSON.stringify(data.response.headers, null, 2)}

--- BODY (first 2000 chars) ---
${data.response.body || '[Empty Body]'}`;

            resultsDiv.textContent = formattedOutput;

        } catch (error) {
            resultsDiv.textContent = `获取信息时发生错误: ${error.message}`;
        }
    });

    copyBtn.addEventListener('click', function() {
        const textToCopy = resultsDiv.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.textContent = '已复制!';
            setTimeout(() => { copyBtn.textContent = '一键复制'; }, 2000);
        }).catch(err => {
            console.error('复制失败: ', err);
            copyBtn.textContent = '复制失败';
        });
    });

    closeModalBtn.addEventListener('click', () => debugModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == debugModal) {
            debugModal.style.display = 'none';
        }
    });
});