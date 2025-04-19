function abrirSite() {
    const urlInput = document.getElementById("urlInput").value;
    const iframe = document.getElementById("webFrame");

    if (!urlInput.trim()) {
        alert("Por favor, digite uma URL.");
        return;
    }

    let finalUrl = urlInput;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
    }

    iframe.src = finalUrl;
}

function voltar() {
    window.location.href = "index.html"; // Ajustado conforme sua estrutura
}
