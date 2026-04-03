// #region Helpers
/**
 * Maskiert HTML-Sonderzeichen, damit Suchtreffer sicher als HTML ausgegeben
 * und spaeter mit <mark> kombiniert werden koennen.
 *
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
// #endregion Helpers

// #region Search Normalization
/**
 * Vereinheitlicht den Suchtext fuer Vergleiche:
 * trimmt Leerzeichen und wandelt alles in Kleinbuchstaben um.
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeSearchText(text) {
  return String(text || "")
    .trim()
    .toLowerCase();
}

/**
 * Zerlegt den Suchtext in einzelne Suchbegriffe.
 * Mehrere Leerzeichen werden dabei ignoriert.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function getSearchTerms(text) {
  const normalizedSearchText = normalizeSearchText(text);

  if (normalizedSearchText === "") {
    return [];
  }

  return normalizedSearchText.split(" ").filter((term) => term !== "");
}
// #endregion Search Normalization

// #region Search Matching
/**
 * Prueft, ob alle Suchbegriffe in den ausgewaehlten Feldern vorkommen.
 * Die Begriffe duerfen dabei ueber verschiedene Felder verteilt sein.
 *
 * @param {Object.<string, string>} fields
 * @param {string} searchText
 * @param {string[]} selectedFields
 * @returns {boolean}
 */
export function entityMatchesSearch(fields, searchText, selectedFields) {
  const searchTerms = getSearchTerms(searchText);

  if (searchTerms.length === 0) {
    return true;
  }

  if (selectedFields.length === 0) {
    return false;
  }

  for (const searchTerm of searchTerms) {
    let hasMatch = false;

    for (const fieldName of selectedFields) {
      const fieldValue = normalizeSearchText(fields[fieldName]);

      if (fieldValue.includes(searchTerm)) {
        hasMatch = true;
        break;
      }
    }

    if (!hasMatch) {
      return false;
    }
  }

  return true;
}
// #endregion Search Matching

// #region Highlighting
/**
 * Hebt alle gefundenen Suchbegriffe im angezeigten Text hervor.
 * Die Logik bleibt absichtlich einfach und markiert Begriffe in der Reihenfolge
 * ihres Auftretens im Text.
 *
 * @param {string} text
 * @param {string} searchText
 * @returns {string}
 */
export function highlightText(text, searchText) {
  const safeText = String(text || "");
  const searchTerms = getSearchTerms(searchText);

  if (searchTerms.length === 0) {
    return escapeHtml(safeText);
  }

  const normalizedText = safeText.toLowerCase();
  let result = "";
  let startIndex = 0;

  while (startIndex < safeText.length) {
    let nextMatchIndex = -1;
    let nextMatchLength = 0;

    for (const searchTerm of searchTerms) {
      const matchIndex = normalizedText.indexOf(searchTerm, startIndex);

      if (matchIndex === -1) {
        continue;
      }

      if (nextMatchIndex === -1 || matchIndex < nextMatchIndex) {
        nextMatchIndex = matchIndex;
        nextMatchLength = searchTerm.length;
      }
    }

    if (nextMatchIndex === -1) {
      result += escapeHtml(safeText.slice(startIndex));
      break;
    }

    result += escapeHtml(safeText.slice(startIndex, nextMatchIndex));
    result += "<mark>" + escapeHtml(safeText.slice(nextMatchIndex, nextMatchIndex + nextMatchLength)) + "</mark>";
    startIndex = nextMatchIndex + nextMatchLength;
  }

  return result;
}
// #endregion Highlighting
