function openPopup(id) {
    const popup = document.getElementById(id);
    if (popup) {
        popup.style.display = "flex";
    }
}

function closePopup(id) {
    const popup = document.getElementById(id);
    if (popup) {
        popup.style.display = "none";
    }
}

// Chiudi il popup se l'utente clicca fuori dal contenuto bianco
window.onclick = function(event) {
    if (event.target.className === 'popup') {
        event.target.style.display = "none";
    }
}
