// Generates the URL slug for a build.
// Format: [year]-[make]-[model]-[chassis]-[username]
// Example: 2023-bmw-m3-g80-max

export function generateBuildSlug(year, make, model, chassis, username) {
  const parts = [year, make, model, chassis, username]
    .filter(Boolean)
    .map(part =>
      String(part)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    )
  return parts.join('-')
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
