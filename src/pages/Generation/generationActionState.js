export function getGenerateActionState(status, isSubmitting) {
  const visible = status === 'ready' || status === 'failed'
  return {
    visible,
    disabled: !visible || isSubmitting,
    label: isSubmitting ? 'Generating…' : status === 'failed' ? 'Retry Generation' : 'Generate Project',
  }
}
