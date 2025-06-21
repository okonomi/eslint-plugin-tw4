export function applyShorthand(value: string) {
  // w-とh-のペアをsize-に変換
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

  // mx-とmy-のペアをm-に変換
  const mxMatch = value.match(/((?:[^:\s]*:)?mx-[^ ]+)/)
  const myMatch = value.match(/((?:[^:\s]*:)?my-[^ ]+)/)

  if (mxMatch && myMatch) {
    const mxClass = mxMatch[1]
    const myClass = myMatch[1]
    const mxPrefix = mxClass.includes(":") ? `${mxClass.split(":")[0]}:` : ""
    const myPrefix = myClass.includes(":") ? `${myClass.split(":")[0]}:` : ""
    const mxValue = mxClass.includes(":")
      ? mxClass.split(":")[1].replace(/^mx-/, "")
      : mxClass.replace(/^mx-/, "")
    const myValue = myClass.includes(":")
      ? myClass.split(":")[1].replace(/^my-/, "")
      : myClass.replace(/^my-/, "")

    if (mxPrefix === myPrefix && mxValue === myValue) {
      const classes = value.split(/\s+/).filter(Boolean)
      const mxIndex = classes.indexOf(mxClass)
      const myIndex = classes.indexOf(myClass)
      const firstIndex = Math.min(mxIndex, myIndex)

      const filteredClasses = classes.filter(
        (cls) => cls !== mxClass && cls !== myClass,
      )

      filteredClasses.splice(firstIndex, 0, `${mxPrefix}m-${mxValue}`)

      return {
        applied: true,
        value: filteredClasses.join(" "),
        classnames: `${mxClass} ${myClass}`,
        shorthand: `${mxPrefix}m-${mxValue}`,
      }
    }
  }

  // px-とpy-のペアをp-に変換
  const pxMatch = value.match(/((?:[^:\s]*:)?px-[^ ]+)/)
  const pyMatch = value.match(/((?:[^:\s]*:)?py-[^ ]+)/)

  if (pxMatch && pyMatch) {
    const pxClass = pxMatch[1]
    const pyClass = pyMatch[1]
    const pxPrefix = pxClass.includes(":") ? `${pxClass.split(":")[0]}:` : ""
    const pyPrefix = pyClass.includes(":") ? `${pyClass.split(":")[0]}:` : ""
    const pxValue = pxClass.includes(":")
      ? pxClass.split(":")[1].replace(/^px-/, "")
      : pxClass.replace(/^px-/, "")
    const pyValue = pyClass.includes(":")
      ? pyClass.split(":")[1].replace(/^py-/, "")
      : pyClass.replace(/^py-/, "")

    if (pxPrefix === pyPrefix && pxValue === pyValue) {
      const classes = value.split(/\s+/).filter(Boolean)
      const pxIndex = classes.indexOf(pxClass)
      const pyIndex = classes.indexOf(pyClass)
      const firstIndex = Math.min(pxIndex, pyIndex)

      const filteredClasses = classes.filter(
        (cls) => cls !== pxClass && cls !== pyClass,
      )

      filteredClasses.splice(firstIndex, 0, `${pxPrefix}p-${pxValue}`)

      return {
        applied: true,
        value: filteredClasses.join(" "),
        classnames: `${pxClass} ${pyClass}`,
        shorthand: `${pxPrefix}p-${pxValue}`,
      }
    }
  }

  // mt-1 mb-1 mr-1 ml-1 を m-1 に変換
  const mtMatch = value.match(/((?:[^:\s]*:)?mt-[^ ]+)/)
  const mbMatch = value.match(/((?:[^:\s]*:)?mb-[^ ]+)/)
  const mrMatch = value.match(/((?:[^:\s]*:)?mr-[^ ]+)/)
  const mlMatch = value.match(/((?:[^:\s]*:)?ml-[^ ]+)/)

  if (mtMatch && mbMatch && mrMatch && mlMatch) {
    const mtClass = mtMatch[1]
    const mbClass = mbMatch[1]
    const mrClass = mrMatch[1]
    const mlClass = mlMatch[1]

    // プレフィックスと値を抽出
    const mtPrefix = mtClass.includes(":") ? `${mtClass.split(":")[0]}:` : ""
    const mbPrefix = mbClass.includes(":") ? `${mbClass.split(":")[0]}:` : ""
    const mrPrefix = mrClass.includes(":") ? `${mrClass.split(":")[0]}:` : ""
    const mlPrefix = mlClass.includes(":") ? `${mlClass.split(":")[0]}:` : ""

    const mtValue = mtClass.includes(":")
      ? mtClass.split(":")[1].replace(/^mt-/, "")
      : mtClass.replace(/^mt-/, "")
    const mbValue = mbClass.includes(":")
      ? mbClass.split(":")[1].replace(/^mb-/, "")
      : mbClass.replace(/^mb-/, "")
    const mrValue = mrClass.includes(":")
      ? mrClass.split(":")[1].replace(/^mr-/, "")
      : mrClass.replace(/^mr-/, "")
    const mlValue = mlClass.includes(":")
      ? mlClass.split(":")[1].replace(/^ml-/, "")
      : mlClass.replace(/^ml-/, "")

    // 全てのプレフィックスと値が同じ場合のみ変換
    if (
      mtPrefix === mbPrefix &&
      mbPrefix === mrPrefix &&
      mrPrefix === mlPrefix &&
      mtValue === mbValue &&
      mbValue === mrValue &&
      mrValue === mlValue
    ) {
      const classes = value.split(/\s+/).filter(Boolean)
      const indices = [
        classes.indexOf(mtClass),
        classes.indexOf(mbClass),
        classes.indexOf(mrClass),
        classes.indexOf(mlClass),
      ].filter((i) => i !== -1)
      const firstIndex = Math.min(...indices)

      const filteredClasses = classes.filter(
        (cls) =>
          cls !== mtClass &&
          cls !== mbClass &&
          cls !== mrClass &&
          cls !== mlClass,
      )

      filteredClasses.splice(firstIndex, 0, `${mtPrefix}m-${mtValue}`)

      return {
        applied: true,
        value: filteredClasses.join(" "),
        classnames: `${mtClass} ${mbClass} ${mrClass} ${mlClass}`,
        shorthand: `${mtPrefix}m-${mtValue}`,
      }
    }
  }

  // pt-1 pb-1 pr-1 pl-1 を p-1 に変換
  const ptMatch = value.match(/((?:[^:\s]*:)?pt-[^ ]+)/)
  const pbMatch = value.match(/((?:[^:\s]*:)?pb-[^ ]+)/)
  const prMatch = value.match(/((?:[^:\s]*:)?pr-[^ ]+)/)
  const plMatch = value.match(/((?:[^:\s]*:)?pl-[^ ]+)/)

  if (ptMatch && pbMatch && prMatch && plMatch) {
    const ptClass = ptMatch[1]
    const pbClass = pbMatch[1]
    const prClass = prMatch[1]
    const plClass = plMatch[1]

    // プレフィックスと値を抽出
    const ptPrefix = ptClass.includes(":") ? `${ptClass.split(":")[0]}:` : ""
    const pbPrefix = pbClass.includes(":") ? `${pbClass.split(":")[0]}:` : ""
    const prPrefix = prClass.includes(":") ? `${prClass.split(":")[0]}:` : ""
    const plPrefix = plClass.includes(":") ? `${plClass.split(":")[0]}:` : ""

    const ptValue = ptClass.includes(":")
      ? ptClass.split(":")[1].replace(/^pt-/, "")
      : ptClass.replace(/^pt-/, "")
    const pbValue = pbClass.includes(":")
      ? pbClass.split(":")[1].replace(/^pb-/, "")
      : pbClass.replace(/^pb-/, "")
    const prValue = prClass.includes(":")
      ? prClass.split(":")[1].replace(/^pr-/, "")
      : prClass.replace(/^pr-/, "")
    const plValue = plClass.includes(":")
      ? plClass.split(":")[1].replace(/^pl-/, "")
      : plClass.replace(/^pl-/, "")

    // 全てのプレフィックスと値が同じ場合のみ変換
    if (
      ptPrefix === pbPrefix &&
      pbPrefix === prPrefix &&
      prPrefix === plPrefix &&
      ptValue === pbValue &&
      pbValue === prValue &&
      prValue === plValue
    ) {
      const classes = value.split(/\s+/).filter(Boolean)
      const indices = [
        classes.indexOf(ptClass),
        classes.indexOf(pbClass),
        classes.indexOf(prClass),
        classes.indexOf(plClass),
      ].filter((i) => i !== -1)
      const firstIndex = Math.min(...indices)

      const filteredClasses = classes.filter(
        (cls) =>
          cls !== ptClass &&
          cls !== pbClass &&
          cls !== prClass &&
          cls !== plClass,
      )

      filteredClasses.splice(firstIndex, 0, `${ptPrefix}p-${ptValue}`)

      return {
        applied: true,
        value: filteredClasses.join(" "),
        classnames: `${ptClass} ${pbClass} ${prClass} ${plClass}`,
        shorthand: `${ptPrefix}p-${ptValue}`,
      }
    }
  }

  return {
    applied: false,
    value,
  }
}
