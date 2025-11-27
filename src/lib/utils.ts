export function getTodayStr() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function formatRate(rate: number): string {
  if (typeof rate !== 'number' || isNaN(rate)) return 'N/A';
  return `${rate.toFixed(1)}%`;
}

export function resetDatesToToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const filterForm = document.getElementById('date-filter-form') as HTMLFormElement;
  const startDateInput = document.querySelector('input[name="start_date"]') as HTMLInputElement;
  const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;

  if (startDateInput && endDateInput && filterForm) {
    startDateInput.value = todayStr;
    endDateInput.value = todayStr;
    filterForm.submit();
  }
}
export function formatDuelResult(result: 'win' | 'lose' | null) {
  if (result === 'win') return 'O';
  if (result === 'lose') return 'X';
  return '';
}
