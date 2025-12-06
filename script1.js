// CodeMirror एडिटर इंस्टेंस को स्टोर करने के लिए एक ऑब्जेक्ट
const editors = {};
let currentEditorType = 'html';

// ----------------------------------------------------------------
// 1. CodeMirror को इनिशियलाइज़ करना
// ----------------------------------------------------------------

function initCodeMirror() {
    // CodeMirror सेटिंग्स
    const baseOptions = {
        lineNumbers: true, // लाइन नंबर दिखाना
        theme: 'monokai', // थीम सेट करना
        indentUnit: 4, // 4 स्पेस का इंडेंट
        autoCloseTags: true, // टैग को ऑटो-क्लोज करना
        autofocus: true,
    };

    // HTML एडिटर
    editors.html = CodeMirror.fromTextArea(document.getElementById('html-content'), {
        ...baseOptions,
        mode: 'htmlmixed'
    });
    
    // CSS एडिटर
    editors.css = CodeMirror.fromTextArea(document.getElementById('css-content'), {
        ...baseOptions,
        mode: 'css'
    });
    
    // JS एडिटर
    editors.js = CodeMirror.fromTextArea(document.getElementById('js-content'), {
        ...baseOptions,
        mode: 'javascript'
    });

    // सभी एडिटर में इवेंट लिसनर जोड़ना ताकि टाइप करते ही प्रीव्यू अपडेट हो जाए
    Object.values(editors).forEach(editor => {
        editor.on('change', updatePreview);
    });

    // HTML एडिटर को डिफ़ॉल्ट रूप से दिखाना
    editors.html.getWrapperElement().style.display = 'block';
    editors.css.getWrapperElement().style.display = 'none';
    editors.js.getWrapperElement().style.display = 'none';
}

// ----------------------------------------------------------------
// 2. लाइव प्रीव्यू अपडेट करना
// ----------------------------------------------------------------

function updatePreview() {
    const htmlCode = editors.html.getValue();
    const cssCode = editors.css.getValue();
    const jsCode = editors.js.getValue();
    const iframe = document.getElementById('live-preview');
    
    // Full Code Injection
    const fullCode = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>${cssCode}</style>
        </head>
        <body>
            ${htmlCode}
            <script>${jsCode}</script>
        </body>
        </html>
    `;

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(fullCode);
    iframe.contentWindow.document.close();
}

// ----------------------------------------------------------------
// 3. फ़ाइल टैब बदलना
// ----------------------------------------------------------------

function showCode(type) {
    // सभी एडिटर को छिपाना और केवल चुने हुए को दिखाना
    Object.keys(editors).forEach(key => {
        const editorElement = editors[key].getWrapperElement();
        if (key === type) {
            editorElement.style.display = 'block';
            editors[key].refresh(); // CodeMirror को रिफ्रेश करना ताकि यह ठीक से दिखे
            currentEditorType = type;
        } else {
            editorElement.style.display = 'none';
        }
    });

    // टैब बटन्स को सक्रिय (active) करना
    document.querySelectorAll('.tab-button').forEach(tab => {
        if (tab.getAttribute('data-type') === type) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// ----------------------------------------------------------------
// 4. डिवाइस साइज़ बदलना
// ----------------------------------------------------------------

function changeDevice() {
    const select = document.getElementById('device-select');
    const previewWindow = document.querySelector('.preview-window');
    const selectedDevice = select.value;
    
    previewWindow.classList.remove('mobile', 'tablet', 'desktop');
    previewWindow.classList.add(selectedDevice);
}

// ----------------------------------------------------------------
// 5. कोड को पैक करके डाउनलोड करना
// ----------------------------------------------------------------

function downloadCode() {
    const htmlCode = editors.html.getValue();
    const cssCode = editors.css.getValue();
    const jsCode = editors.js.getValue();
    
    const fullCode = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>डाउनलोड किया गया कोड</title>
    <style>
${cssCode}
    </style>
</head>
<body>
${htmlCode}
    <script>
${jsCode}
    </script>
</body>
</html>
    `;

    const blob = new Blob([fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_packed_website.html';
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('कोड my_packed_website.html के रूप में पैक और डाउनलोड हो गया है।');
}

// ----------------------------------------------------------------
// 6. इवेंट्स को जोड़ना
// ----------------------------------------------------------------

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (event) => {
        showCode(event.target.getAttribute('data-type'));
    });
});

window.onload = () => {
    initCodeMirror(); // CodeMirror शुरू करें
    updatePreview();  // शुरुआती प्रीव्यू दिखाएं
    showCode('html'); // डिफ़ॉल्ट रूप से HTML टैब दिखाएं
};
