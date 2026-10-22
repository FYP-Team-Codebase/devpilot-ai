const PURPOSES = new Set([
  "logo", "background", "content-image", "design-reference",
  "requirements-document", "icon-illustration", "portfolio-gallery", "other",
]);
const PLACEMENTS = new Set(["ai", "header", "footer", "hero", "product", "gallery", "section", "other"]);

function normalizeAssetSelections(input) {
  if (!Array.isArray(input) || input.length > 20) {
    throw new Error("Select no more than 20 project assets.");
  }
  const seen = new Set();
  return input.map((item, index) => {
    const assetId = String(item?.assetId || "");
    const purpose = String(item?.purpose || "other");
    const placement = String(item?.placement || "ai");
    if (!assetId || seen.has(assetId) || !PURPOSES.has(purpose) || !PLACEMENTS.has(placement)) {
      throw new Error("One or more project asset settings are invalid.");
    }
    seen.add(assetId);
    const customPurpose = typeof item.customPurpose === "string" ? item.customPurpose.trim().slice(0, 160) : "";
    const placementDetails = typeof item.placementDetails === "string" ? item.placementDetails.trim().slice(0, 160) : "";
    const instructions = typeof item.instructions === "string" ? item.instructions.trim().slice(0, 1000) : "";
    if (purpose === "other" && !customPurpose) throw new Error("Describe the intended use of each asset marked Other.");
    if (placement === "other" && !placementDetails) throw new Error("Describe the placement for each asset marked Other.");
    return { assetId, purpose, customPurpose, placement, placementDetails, instructions, order: index };
  });
}

module.exports = { normalizeAssetSelections };
