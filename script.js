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

    // 1. Load the iframe
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

    // 2. Show the debug modal
    showDebugBtn.addEventListener('click', async function() {
        if (!currentUrl) {
            alert('请先加载一个页面。');
            return;
        }

        resultsDiv.textContent = '加载中...';
        copyBtn.textContent = '一键复制'; // Reset button text
        debugModal.style.display = 'block';

        try {
            const response = await fetch('/fetch-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: currentUrl })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || '请求失败');

            resultsDiv.textContent = JSON.stringify(data, null, 2);

        } catch (error) {
            resultsDiv.textContent = `获取信息时发生错误: ${error.message}`;
        }
    });

    // 3. Implement the copy functionality
    copyBtn.addEventListener('click', function() {
        const textToCopy = resultsDiv.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.textContent = '已复制!';
            setTimeout(() => { 
                copyBtn.textContent = '一键复制'; 
            }, 2000); // Revert back after 2 seconds
        }).catch(err => {
            console.error('复制失败: ', err);
            copyBtn.textContent = '复制失败';
        });
    });

    // 4. Handle closing the modal
    closeModalBtn.addEventListener('click', () => debugModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == debugModal) {
            debugModal.style.display = 'none';
        }
    });
});