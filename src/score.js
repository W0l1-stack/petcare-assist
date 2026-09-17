export function calculateCareScore({ walks = [], wellness = [], journal = [], careTasks = [], routines = [] }) {
  const notes = wellness.length + journal.length;
  const tasks = careTasks.length ? careTasks : routines;
  if (!walks.length && !notes && !tasks.length) return null;
  const recent = walks.filter(w => Date.now() - new Date(w.date).getTime() <= 7 * 86400000);
  const recentWalkMinutes = recent.reduce((sum, w) => sum + (w.minutes || 0), 0);
  const weeklyWalkScore = Math.min(45, recentWalkMinutes * 1.5);
  const consistencyScore = Math.min(25, new Set(recent.map(w => new Date(w.date).toDateString())).size * 5);
  const wellnessScore = Math.min(15, notes * 3);
  const completedRoutines = tasks.filter(t => t.completed || t.lastCompleted).length;
  const routineScore = Math.min(15, completedRoutines * 3);
  return Math.round(Math.min(100, weeklyWalkScore + consistencyScore + wellnessScore + routineScore));
}

export function scoreLabel(score) {
  if (score === null) return 'Not enough activity data';
  if (score < 35) return 'Getting started';
  if (score < 65) return 'Building a routine';
  if (score < 85) return 'Consistent care';
  return 'Strong routine';
}
