document.addEventListener('DOMContentLoaded', function() {

    const urlForm = document.getElementById('url-form');
    const urlInput = document.getElementById('url-input');
    const iframe = document.getElementById('content-iframe');
    const debugControls = document.getElementById('debug-controls');
    const showDebugBtn = document.getElementById('show-debug-btn');
    const debugModal = document.getElementById('debug-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const copyBtn = document.getElementById('copy-btn');
    const tabContainer = document.querySelector('.tab-container');

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

        // Reset UI
        const allTabs = tabContainer.querySelectorAll('.tab-content pre');
        allTabs.forEach(tab => tab.textContent = '加载中...');
        copyBtn.textContent = '复制当前Tab';
        debugModal.style.display = 'block';

        try {
            const response = await fetch('/fetch-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: currentUrl })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || '请求失败');

            // Populate tabs
            document.getElementById('summary-results').textContent = JSON.stringify(data.summary, null, 2);
            document.getElementById('dns-results').textContent = JSON.stringify(data.dns, null, 2);
            document.getElementById('headers-results').textContent = JSON.stringify(data.headers, null, 2);
            document.getElementById('body-results').textContent = data.body || '[Empty Body]';
            document.getElementById('tls-results').textContent = JSON.stringify(data.tls, null, 2);
            document.getElementById('client-info-results').textContent = JSON.stringify(data.clientInfo, null, 2);

        } catch (error) {
            document.getElementById('summary-results').textContent = `获取信息时发生错误: ${error.message}`;
            allTabs.forEach(tab => {
                if (tab.id !== 'summary-results') tab.textContent = '错误，请先查看概览Tab。';
            });
        }
    });

    // Tab switching logic
    tabContainer.addEventListener('click', (event) => {
        if (!event.target.matches('.tab-button')) return;

        // Update button styles
        const buttons = tabContainer.querySelectorAll('.tab-button');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Show correct content
        const contents = tabContainer.querySelectorAll('.tab-content');
        contents.forEach(content => content.classList.remove('active'));
        const activeTabId = event.target.dataset.tab;
        document.getElementById(activeTabId).classList.add('active');
    });

    copyBtn.addEventListener('click', function() {
        const activeTabContent = document.querySelector('.tab-content.active pre');
        if (!activeTabContent) return;

        navigator.clipboard.writeText(activeTabContent.textContent).then(() => {
            copyBtn.textContent = '已复制!';
            setTimeout(() => { copyBtn.textContent = '复制当前Tab'; }, 2000);
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