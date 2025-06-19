export function shorthand(value: string) {
  const pairs = [
    { w: /w-([^ ]+)/, h: /h-([^ ]+)/, shorthand: "size-" },
    { w: /min-w-([^ ]+)/, h: /min-h-([^ ]+)/, shorthand: "min-size-" },
    { w: /max-w-([^ ]+)/, h: /max-h-([^ ]+)/, shorthand: "max-size-" },
  ]
  for (const { w, h, shorthand } of pairs) {
    const wMatch = value.match(w)
    const hMatch = value.match(h)
    if (wMatch && hMatch && wMatch[1] === hMatch[1]) {
      // w-とh-の両方を削除し、shorthandを先頭に追加
      const newValue = value
        .replace(new RegExp(`\\b${wMatch[0]}\\b`), "")
        .replace(new RegExp(`\\b${hMatch[0]}\\b`), "")
        .replace(/\s+/g, " ")
        .trim()
      const classString = newValue
        ? `${shorthand}${wMatch[1]} ${newValue}`
        : `${shorthand}${wMatch[1]}`

      return classString
    }
  }

  return value
}
