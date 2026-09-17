export function calculateCareScore({ walks = [], wellness = [], careTasks = [] }) {
  if (!walks.length && !wellness.length && !careTasks.length) return null;
  const recentWalkMinutes = walks.filter(w => Date.now() - new Date(w.date).getTime() <= 7 * 86400000).reduce((sum, w) => sum + (w.minutes || 0), 0);
  const weeklyWalkScore = Math.min(45, recentWalkMinutes * 1.5);
  const consistencyScore = Math.min(25, new Set(walks.filter(w => Date.now() - new Date(w.date).getTime() <= 7 * 86400000).map(w => new Date(w.date).toDateString())).size * 5);
  const wellnessScore = Math.min(15, wellness.length * 3);
  const routineScore = Math.min(15, careTasks.filter(t => t.completed).length * 3);
  return Math.round(Math.min(100, weeklyWalkScore + consistencyScore + wellnessScore + routineScore));
}

export function scoreLabel(score) {
  if (score === null) return 'Not enough activity data';
  if (score < 35) return 'Getting started';
  if (score < 65) return 'Building a routine';
  if (score < 85) return 'Consistent care';
  return 'Strong routine';
}
