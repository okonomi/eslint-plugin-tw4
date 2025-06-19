export function shorthand(value: string) {
  const pairs = [
    {
      w: /((?:[^:\s]*:)?w-[^ ]+)/,
      h: /((?:[^:\s]*:)?h-[^ ]+)/,
      shorthand: "size-",
    },
    {
      w: /((?:[^:\s]*:)?min-w-[^ ]+)/,
      h: /((?:[^:\s]*:)?min-h-[^ ]+)/,
      shorthand: "min-size-",
    },
    {
      w: /((?:[^:\s]*:)?max-w-[^ ]+)/,
      h: /((?:[^:\s]*:)?max-h-[^ ]+)/,
      shorthand: "max-size-",
    },
  ]
  for (const { w, h, shorthand } of pairs) {
    const wMatch = value.match(w)
    const hMatch = value.match(h)
    if (wMatch && hMatch) {
      // プレフィックスと値を抽出
      const wClass = wMatch[1]
      const hClass = hMatch[1]
      const wPrefix = wClass.includes(":") ? `${wClass.split(":")[0]}:` : ""
      const hPrefix = hClass.includes(":") ? `${hClass.split(":")[0]}:` : ""
      const wValue = wClass.includes(":")
        ? wClass.split(":")[1].replace(/^(min-|max-)?w-/, "")
        : wClass.replace(/^(min-|max-)?w-/, "")
      const hValue = hClass.includes(":")
        ? hClass.split(":")[1].replace(/^(min-|max-)?h-/, "")
        : hClass.replace(/^(min-|max-)?h-/, "")

      // プレフィックスと値が同じ場合のみ変換
      if (wPrefix === hPrefix && wValue === hValue) {
        // スペースで分割して、該当するクラスを除外し、shorthandを追加
        const classes = value.split(/\s+/).filter(Boolean)
        const wIndex = classes.indexOf(wClass)
        const hIndex = classes.indexOf(hClass)
        const firstIndex = Math.min(wIndex, hIndex)

        // w-とh-を除外
        const filteredClasses = classes.filter(
          (cls) => cls !== wClass && cls !== hClass,
        )

        // 最初に出現した位置にshorthandを挿入
        filteredClasses.splice(firstIndex, 0, `${wPrefix}${shorthand}${wValue}`)

        return filteredClasses.join(" ")
      }
    }
  }

  return value
}
