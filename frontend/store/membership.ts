export function isMember(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('cashpe-member') === 'true'
}

export function joinMembership(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('cashpe-member', 'true')
}