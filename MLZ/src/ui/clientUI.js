const clientForm = document.getElementById("client-form");
const clientNameInput = document.getElementById("client-name");
const clientAddressInput = document.getElementById("client-address");

export async function loadClients() {
  const clients = await api.getClients();

  renderClientOptionsForProjectForm(clients);

  if (clients.length === 0) {
    setAppStatus("Keine Kunden geladen.");
    return;
  }
  setAppStatus("Alle Daten vom Server geladen.");
}

function getClientFormData() {
  return {
    name: clientNameInput.value.trim(),
    address: clientAddressInput.value.trim(),
  };
}

async function onClientFormSubmit(event) {
  event.preventDefault();

  if (!clientForm.checkValidity()) {
    clientForm.reportValidity();
    return;
  }

  const newClient = getClientFormData();

  try {
    await api.createClient(newClient);
    clientForm.reset();
    await loadClients();
    showMessageBox("Kunde '" + newClient.name + "' wurde gespeichert!", "green");
  } catch (error) {
    showMessageBox("Fehler: " + error.message, "crimson");
  }
}

clientForm.addEventListener("submit", onClientFormSubmit);
