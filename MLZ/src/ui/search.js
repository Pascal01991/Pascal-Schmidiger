function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function normalizeSearchText(text) {
  return String(text || "").trim().toLowerCase();
}

export function getSearchTerms(text) {
  const normalizedSearchText = normalizeSearchText(text);

  if (normalizedSearchText === "") {
    return [];
  }

  return normalizedSearchText.split(" ").filter((term) => term !== "");
}

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
