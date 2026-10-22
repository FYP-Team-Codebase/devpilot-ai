const GENERATION_FAILURES = Object.freeze({
  PROVIDER_NOT_CONFIGURED: [503, "AI generation is not configured on the server."],
  VISION_MODEL_REQUIRED: [503, "The configured AI model cannot process the selected visual references."],
  PROVIDER_UNAVAILABLE: [502, "Could not reach the AI provider. Check the backend network connection and try again."],
  PROVIDER_TIMEOUT: [504, "The AI provider did not respond before the generation deadline. Please retry, or reduce the project scope and attached references."],
  GENERATION_BUDGET_EXHAUSTED: [504, "Project generation exceeded the server execution budget. Please retry with a smaller project or fewer references."],
  GENERATION_CALL_LIMIT_EXCEEDED: [504, "Project generation reached its bounded provider-call limit. Reduce project scope and retry."],
  GENERATION_CANCELLED: [499, "Generation was cancelled because the client disconnected."],
  PROVIDER_ERROR: [502, "The AI provider could not complete this generation. Please try again."],
  MALFORMED_PROVIDER_RESPONSE: [502, "The AI provider returned an invalid generation response. Please try again."],
  INCOMPLETE_PROVIDER_RESPONSE: [502, "The AI provider stopped before completing the generated project. Retry with a smaller or more focused project request."],
  GENERATION_MANIFEST_INVALID: [422, "The AI provider could not produce a safe, consistent file plan for this project. Clarify the requirements and retry."],
  STAGED_FILE_INVALID: [422, "The AI provider returned an invalid staged file response. Retry generation."],
  STAGED_FILE_INCOMPLETE: [502, "The AI provider could not complete one project file within the output limit. Reduce that feature's scope and retry."],
  GENERATION_OUTPUT_LIMIT_EXCEEDED: [422, "Generated project output exceeded the configured staged size limit. Reduce the project scope and retry."],
  INVALID_GENERATED_PROJECT: [422, "The generated project did not pass validation. Review the project requirements and try again."],
  QUALITY_REPAIR_FAILED: [422, "The generated website did not pass preview styling checks after one targeted repair attempt. Review the requirements or try again."],
  QUALITY_REPAIR_PROVIDER_FAILED: [502, "The initial output failed quality checks and the AI provider could not complete the repair request. Please retry generation."],
  ASSET_UNAVAILABLE: [409, "A selected asset is unavailable. Remove it or select an available asset, then retry."],
  ASSET_PROCESSING_FAILED: [422, "A selected asset could not be processed. Check the file and try again."],
  INSPIRATION_UNAVAILABLE: [409, "A selected inspiration is unavailable. Remove it or select another inspiration, then retry."],
  ASSET_NOT_USED: [422, "The generated project did not use a selected image. Retry generation or revise the asset instructions."],
});

function getGenerationFailureResponse(error) {
  const code = error?.code;
  const mapped = GENERATION_FAILURES[code];
  if (mapped) {
    const [status, message] = mapped;
    // Preserve safe, actionable validation details for application-generated errors.
    const useErrorMessage = (status === 422 || code === "QUALITY_REPAIR_PROVIDER_FAILED")
      && typeof error?.message === "string";
    return { status, code, requestId: error?.generationId || null, message: useErrorMessage ? error.message.slice(0, 500) : message };
  }
  return { status: 500, code: "GENERATION_INTERNAL_ERROR", requestId: error?.generationId || null, message: "Project generation failed due to a server error. Please try again." };
}

module.exports = { getGenerationFailureResponse };
