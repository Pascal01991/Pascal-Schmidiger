// #region Time in Project

const projectSelect = document.getElementById("project-select");

/**
 * @param {Project[]} projects
 */
export function renderProjectOptionsForTimeForm(projects) {
  projectSelect.innerHTML = '<option value="">-- Bitte waehlen --</option>';

  for (const project of projects) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    projectSelect.appendChild(option);
  }
}

// #endregion Time in Project
