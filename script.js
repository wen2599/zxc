document.addEventListener('DOMContentLoaded', function() {

    const urlForm = document.getElementById('url-form');
    const urlInput = document.getElementById('url-input');
    const iframe = document.getElementById('content-iframe');
    const debugControls = document.getElementById('debug-controls');
    const showDebugBtn = document.getElementById('show-debug-btn');
    const debugModal = document.getElementById('debug-modal');
    const resultsDiv = document.getElementById('results');
    const closeModalBtn = document.querySelector('.close-btn');

    let currentUrl = '';

    // 1. Handle the main form submission to load the iframe
    urlForm.addEventListener('submit', function(event) {
        event.preventDefault();
        let url = urlInput.value.trim();

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        currentUrl = url;
        iframe.src = currentUrl;
        debugControls.style.display = 'block'; // Show the 'View Debug Info' button
    });

    // 2. Handle the 'View Debug Info' button click
    showDebugBtn.addEventListener('click', async function() {
        if (!currentUrl) {
            alert('请先加载一个页面。');
            return;
        }

        resultsDiv.textContent = '加载中...';
        debugModal.style.display = 'block'; // Show the modal

        try {
            const response = await fetch('/fetch-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: currentUrl })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            resultsDiv.textContent = JSON.stringify(data, null, 2);

        } catch (error) {
            resultsDiv.textContent = `获取信息时发生错误: ${error.message}`;
        }
    });

    // 3. Handle closing the modal
    closeModalBtn.addEventListener('click', function() {
        debugModal.style.display = 'none';
    });

    // Also close the modal if the user clicks anywhere outside of the modal content
    window.addEventListener('click', function(event) {
        if (event.target == debugModal) {
            debugModal.style.display = 'none';
        }
    });

});