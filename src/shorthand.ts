export function applyShorthand(value: string) {
  // w-とh-のペアのみ対応
  const wMatch = value.match(/((?:[^:\s]*:)?w-[^ ]+)/)
  const hMatch = value.match(/((?:[^:\s]*:)?h-[^ ]+)/)

  if (wMatch && hMatch) {
    // プレフィックスと値を抽出
    const wClass = wMatch[1]
    const hClass = hMatch[1]
    const wPrefix = wClass.includes(":") ? `${wClass.split(":")[0]}:` : ""
    const hPrefix = hClass.includes(":") ? `${hClass.split(":")[0]}:` : ""
    const wValue = wClass.includes(":")
      ? wClass.split(":")[1].replace(/^w-/, "")
      : wClass.replace(/^w-/, "")
    const hValue = hClass.includes(":")
      ? hClass.split(":")[1].replace(/^h-/, "")
      : hClass.replace(/^h-/, "")

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
      filteredClasses.splice(firstIndex, 0, `${wPrefix}size-${wValue}`)

      return {
        applied: true,
        value: filteredClasses.join(" "),
        classnames: `${wClass} ${hClass}`,
        shorthand: `${wPrefix}size-${wValue}`,
      }
    }
  }

  return {
    applied: false,
    value,
  }
}
