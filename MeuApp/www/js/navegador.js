// Função chamada ao clicar no botão "Ir"
function abrirSite() {
    const urlInput = document.getElementById("urlInput").value;
    const iframe = document.getElementById("webFrame");

    // Verifica se o campo está vazio
    if (!urlInput.trim()) {
        alert("Por favor, digite uma URL.");
        return;
    }

    let finalUrl = urlInput;

    // Adiciona https:// se não estiver presente na URL
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
    }

    // Define a URL no iframe para simular navegação
    iframe.src = finalUrl;
}

// Função chamada ao clicar no botão "Voltar"
function voltar() {
    // Redireciona para a página inicial
    window.location.href = "index.html";
}
