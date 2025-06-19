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
      // スペースで分割して、該当するクラスを除外し、shorthandを追加
      const classes = value.split(/\s+/).filter(Boolean)
      const filteredClasses = classes.filter(
        (cls) => cls !== wMatch[0] && cls !== hMatch[0],
      )
      const result = [`${shorthand}${wMatch[1]}`, ...filteredClasses].join(" ")
      return result
    }
  }

  return value
}
