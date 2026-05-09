const STORAGE_KEY = "rh_employees_v1";

const form = document.getElementById("employee-form");
const listElement = document.getElementById("employee-list");
const emptyStateElement = document.getElementById("empty-state");
const searchInput = document.getElementById("search");
const importInput = document.getElementById("import-json-input");
const importBtn = document.getElementById("import-btn");
const exportBtn = document.getElementById("export-btn");
const importPreview = document.getElementById("import-preview");
const importPreviewSummary = document.getElementById("import-preview-summary");
const importPreviewList = document.getElementById("import-preview-list");
const importCancelBtn = document.getElementById("import-cancel-btn");
const importConfirmBtn = document.getElementById("import-confirm-btn");

const state = {
  employees: loadEmployees(),
  query: "",
  pendingImportEmployees: [],
};

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const employee = {
    id: crypto.randomUUID(),
    name: String(formData.get("name") || "").trim(),
    role: String(formData.get("role") || "").trim(),
    department: String(formData.get("department") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };

  if (!employee.name || !employee.role || !employee.department || !employee.email) {
    return;
  }

  const emailExists = state.employees.some(emp => emp.email === employee.email);

  if (emailExists) {
    alert("Cet email existe déjà !");
    return;
  }

  state.employees.unshift(employee);
  persistEmployees();
  form.reset();
  render();
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  render();
});

exportBtn.addEventListener("click", () => {
  const json = JSON.stringify(state.employees, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `employees_${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener("click", () => {
  importInput.click();
});

importInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const importedEmployees = normalizeImportedEmployees(parsed);

    if (!importedEmployees.length) {
      alert("Le fichier JSON ne contient aucun employé valide.");
      return;
    }

    openImportPreview(importedEmployees);
  } catch {
    alert("Impossible de lire ce fichier JSON.");
  } finally {
    event.target.value = "";
  }
});

importCancelBtn.addEventListener("click", closeImportPreview);

importConfirmBtn.addEventListener("click", () => {
  const existingEmails = new Set(state.employees.map((employee) => employee.email));
  let importedCount = 0;
  let skippedCount = 0;

  state.pendingImportEmployees.forEach((employee) => {
    if (existingEmails.has(employee.email)) {
      skippedCount += 1;
      return;
    }

    state.employees.unshift(employee);
    existingEmails.add(employee.email);
    importedCount += 1;
  });

  persistEmployees();
  render();
  closeImportPreview();
  alert(`${importedCount} employé(s) importé(s). ${skippedCount} doublon(s) ignoré(s).`);
});

importPreview.addEventListener("click", (event) => {
  if (event.target === importPreview) {
    closeImportPreview();
  }
});

listElement.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) {
    return;
  }

  const employeeId = button.dataset.id;
  state.employees = state.employees.filter((employee) => employee.id !== employeeId);
  persistEmployees();
  render();
});

function loadEmployees() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistEmployees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.employees));
}

function openImportPreview(importedEmployees) {
  state.pendingImportEmployees = importedEmployees;

  const existingEmails = new Set(state.employees.map((employee) => employee.email));
  const duplicateCount = importedEmployees.filter((employee) => existingEmails.has(employee.email)).length;
  const previewCount = Math.min(importedEmployees.length, 5);
  const previewItems = importedEmployees.slice(0, previewCount);

  importPreviewSummary.textContent = `${importedEmployees.length} employé(s) valide(s) détecté(s), dont ${duplicateCount} doublon(s) avec la liste actuelle.`;
  importPreviewList.innerHTML = previewItems
    .map((employee) => {
      return `
        <li class="preview-item">
          <strong>${escapeHtml(employee.name)}</strong>
          <p class="preview-meta">
            ${escapeHtml(employee.role)} · ${escapeHtml(employee.department)}<br />
            ${escapeHtml(employee.email)}
          </p>
        </li>
      `;
    })
    .join("");

  if (importedEmployees.length > previewCount) {
    const remainingCount = importedEmployees.length - previewCount;
    importPreviewList.insertAdjacentHTML(
      "beforeend",
      `<li class="preview-item"><p class="preview-meta">Et ${remainingCount} autre(s) employé(s) à importer.</p></li>`,
    );
  }

  importPreview.hidden = false;
}

function closeImportPreview() {
  state.pendingImportEmployees = [];
  importPreview.hidden = true;
  importPreviewList.innerHTML = "";
  importPreviewSummary.textContent = "";
}

function normalizeImportedEmployees(data) {
  const source = Array.isArray(data) ? data : Array.isArray(data?.employees) ? data.employees : [];

  return source
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const name = String(item.name || "").trim();
      const role = String(item.role || "").trim();
      const department = String(item.department || "").trim();
      const email = String(item.email || "").trim().toLowerCase();

      if (!name || !role || !department || !email) {
        return null;
      }

      return {
        ...item,
        id: typeof item.id === "string" && item.id.trim() ? item.id : crypto.randomUUID(),
        name,
        role,
        department,
        email,
        createdAt: typeof item.createdAt === "string" && item.createdAt.trim() ? item.createdAt : new Date().toISOString(),
      };
    })
    .filter(Boolean);
}

function filterEmployees() {
  const filtered = !state.query 
    ? state.employees 
    : state.employees.filter((employee) => {
        const haystack = `${employee.name} ${employee.role} ${employee.department} ${employee.email}`.toLowerCase();
        return haystack.includes(state.query);
      });

  return filtered.sort((a, b) => a.department.localeCompare(b.department));
}

function render() {
  const visibleEmployees = filterEmployees();

  emptyStateElement.hidden = visibleEmployees.length > 0;

  listElement.innerHTML = visibleEmployees
    .map((employee) => {
      return `
        <li class="employee-item">
          <div>
            <strong>${escapeHtml(employee.name)}</strong>
            <p class="employee-meta">
              ${escapeHtml(employee.role)} · ${escapeHtml(employee.department)}<br />
              ${escapeHtml(employee.email)}
            </p>
          </div>
          <button class="remove-btn" data-id="${employee.id}" type="button">Supprimer</button>
        </li>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
